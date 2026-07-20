/**
 * Local PageSpeed - 로컬 개발 환경용 간이 성능 측정 도구
 * PageSpeed Insights(Lighthouse)의 핵심 지표를 브라우저 Performance API로 근사 측정합니다.
 *
 * 사용법
 * 1) 스크립트 태그로 포함 (권장)
 *    <script src="local-pagespeed.js"></script>  (</body> 직전에 추가)
 *
 * 2) 콘솔에 직접 붙여넣기
 *    이 파일 내용을 복사해서 개발자 도구 콘솔에 붙여넣으면 바로 실행됩니다.
 *
 * 화면 우하단에 "⚡ Perf" 버튼이 생기고, 클릭하면 측정 패널이 열립니다.
 * jQuery / 바닐라 JS / React(Next.js) / Laravel Blade / JSP 등 어떤 스택이든
 * 순수 브라우저 API만 사용하므로 프레임워크와 무관하게 동작합니다.
 */
(function () {
    'use strict';

    if (window.__localPageSpeedLoaded) {
        return;
    }
    window.__localPageSpeedLoaded = true;

    var state = {
        lcp: null,
        lcpFinal: false,
        cls: 0,
        clsEntries: [],
        longTasks: [],
        fcp: null,
        ttfb: null,
        loadTime: null,
        domContentLoaded: null,
        inpCandidate: null,
        resources: []
    };

    // ---------------------------------------------------------------
    // 1. 지표 수집
    // ---------------------------------------------------------------

    function safeObserve(type, callback, options) {
        try {
            var po = new PerformanceObserver(callback);
            po.observe(Object.assign({ type: type, buffered: true }, options || {}));
            return po;
        } catch (e) {
            return null;
        }
    }

    safeObserve('paint', function (list) {
        list.getEntries().forEach(function (entry) {
            if (entry.name === 'first-contentful-paint') {
                state.fcp = entry.startTime;
            }
        });
    });

    var lcpObserver = safeObserve('largest-contentful-paint', function (list) {
        var entries = list.getEntries();
        var last = entries[entries.length - 1];
        if (last && !state.lcpFinal) {
            state.lcp = last.renderTime || last.loadTime || last.startTime;
        }
    });

    function finalizeLcp() {
        state.lcpFinal = true;
        if (lcpObserver) {
            try { lcpObserver.disconnect(); } catch (e) {}
        }
    }
    ['keydown', 'click', 'pointerdown'].forEach(function (evt) {
        addEventListener(evt, finalizeLcp, { once: true, capture: true });
    });
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') {
            finalizeLcp();
        }
    });

    safeObserve('layout-shift', function (list) {
        list.getEntries().forEach(function (entry) {
            if (!entry.hadRecentInput) {
                state.cls += entry.value;
                state.clsEntries.push(entry);
            }
        });
    });

    safeObserve('longtask', function (list) {
        list.getEntries().forEach(function (entry) {
            state.longTasks.push(entry);
        });
    });

    safeObserve('event', function (list) {
        list.getEntries().forEach(function (entry) {
            var duration = entry.processingEnd - entry.startTime;
            if (!state.inpCandidate || duration > state.inpCandidate) {
                state.inpCandidate = duration;
            }
        });
    }, { durationThreshold: 40 });

    function collectNavigationTiming() {
        var nav = performance.getEntriesByType('navigation')[0];
        if (nav) {
            state.ttfb = nav.responseStart - nav.startTime;
            state.domContentLoaded = nav.domContentLoadedEventEnd - nav.startTime;
            state.loadTime = nav.loadEventEnd - nav.startTime;
        }
    }

    function collectResources() {
        state.resources = performance.getEntriesByType('resource').map(function (r) {
            return {
                name: r.name.split('/').pop().split('?')[0] || r.name,
                type: guessType(r),
                transferSize: r.transferSize || 0,
                duration: r.duration
            };
        });
    }

    function guessType(entry) {
        if (entry.initiatorType === 'script') return 'JS';
        if (entry.initiatorType === 'css' || entry.initiatorType === 'link') return 'CSS';
        if (entry.initiatorType === 'img' || /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(entry.name)) return '이미지';
        if (/\.(woff2?|ttf|otf)$/i.test(entry.name)) return '폰트';
        if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') return 'API';
        return '기타';
    }

    // ---------------------------------------------------------------
    // 2. 점수 계산 (Lighthouse 임계값을 단순화하여 근사)
    // ---------------------------------------------------------------

    function scoreFromThresholds(value, good, poor) {
        if (value === null || value === undefined) return null;
        if (value <= good) return 100;
        if (value >= poor) return 0;
        return Math.round(100 - ((value - good) / (poor - good)) * 100);
    }

    function computeScores() {
        var tbt = state.longTasks.reduce(function (sum, t) {
            return sum + Math.max(0, t.duration - 50);
        }, 0);

        var scores = {
            fcp: scoreFromThresholds(state.fcp, 1800, 3000),
            lcp: scoreFromThresholds(state.lcp, 2500, 4000),
            cls: scoreFromThresholds(state.cls * 1000, 100, 250),
            tbt: scoreFromThresholds(tbt, 200, 600),
            ttfb: scoreFromThresholds(state.ttfb, 800, 1800)
        };

        var weights = { lcp: 0.30, tbt: 0.30, cls: 0.15, fcp: 0.15, ttfb: 0.10 };
        var totalWeight = 0;
        var weighted = 0;
        Object.keys(weights).forEach(function (key) {
            if (scores[key] !== null) {
                weighted += scores[key] * weights[key];
                totalWeight += weights[key];
            }
        });
        var overall = totalWeight > 0 ? Math.round(weighted / totalWeight) : null;

        return { scores: scores, overall: overall, tbt: tbt };
    }

    // ---------------------------------------------------------------
    // 3. 개선 제안 (opportunities)
    // ---------------------------------------------------------------

    function buildOpportunities() {
        var tips = [];

        var totalSize = state.resources.reduce(function (s, r) { return s + r.transferSize; }, 0);
        if (totalSize > 3 * 1024 * 1024) {
            tips.push('전체 리소스 용량이 ' + (totalSize / 1024 / 1024).toFixed(1) + 'MB로 큽니다. 이미지 압축/코드 스플리팅을 검토하세요.');
        }

        var bigImages = state.resources.filter(function (r) {
            return r.type === '이미지' && r.transferSize > 200 * 1024;
        });
        if (bigImages.length > 0) {
            tips.push(bigImages.length + '개의 이미지가 200KB를 초과합니다 (예: ' + bigImages[0].name + '). WebP/AVIF 변환이나 리사이징을 고려하세요.');
        }

        var renderBlocking = Array.prototype.slice.call(
            document.querySelectorAll('head link[rel="stylesheet"], head script:not([async]):not([defer])')
        );
        if (renderBlocking.length > 3) {
            tips.push('head 안에 렌더링을 막는 <link>/<script>가 ' + renderBlocking.length + '개 있습니다. defer/async 속성이나 CSS 인라인화를 검토하세요.');
        }

        if (state.resources.length > 80) {
            tips.push('네트워크 요청이 ' + state.resources.length + '개로 많습니다. 리소스 병합이나 lazy loading을 검토하세요.');
        }

        if (state.cls > 0.1) {
            tips.push('레이아웃 이동(CLS)이 감지되었습니다. 이미지/광고 영역에 width, height 또는 aspect-ratio를 지정하세요.');
        }

        if (state.longTasks.length > 5) {
            tips.push('긴 작업(long task)이 ' + state.longTasks.length + '건 감지되었습니다. 무거운 동기 스크립트를 쪼개거나 지연 실행하세요.');
        }

        if (tips.length === 0) {
            tips.push('뚜렷한 문제가 감지되지 않았습니다. 👍');
        }
        return tips;
    }

    // ---------------------------------------------------------------
    // 4. UI 렌더링 (Shadow DOM으로 스타일 격리)
    // ---------------------------------------------------------------

    var host = document.createElement('div');
    host.id = 'local-pagespeed-host';
    host.style.cssText = 'position:fixed;z-index:2147483647;bottom:0;right:0;';
    document.documentElement.appendChild(host);
    var shadow = host.attachShadow({ mode: 'open' });

    var style = document.createElement('style');
    style.textContent = [
        ':host{all:initial;}',
        '*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Malgun Gothic",sans-serif;}',
        '.fab{position:fixed;bottom:20px;right:20px;background:#1a73e8;color:#fff;border:none;',
        'border-radius:24px;padding:12px 18px;font-size:14px;font-weight:600;cursor:pointer;',
        'box-shadow:0 4px 12px rgba(0,0,0,.25);}',
        '.panel{position:fixed;bottom:70px;right:20px;width:360px;max-height:80vh;overflow-y:auto;',
        'background:#fff;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.3);padding:16px;',
        'display:none;color:#202124;}',
        '.panel.open{display:block;}',
        '.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}',
        '.header h2{font-size:15px;margin:0;}',
        '.close{cursor:pointer;background:none;border:none;font-size:18px;color:#5f6368;}',
        '.score-circle{width:88px;height:88px;border-radius:50%;display:flex;align-items:center;',
        'justify-content:center;font-size:28px;font-weight:700;margin:0 auto 14px;}',
        '.good{background:#e6f4ea;color:#137333;}',
        '.mid{background:#fef7e0;color:#b06000;}',
        '.poor{background:#fce8e6;color:#c5221f;}',
        '.metric-row{display:flex;justify-content:space-between;font-size:13px;padding:6px 0;',
        'border-bottom:1px solid #f1f3f4;}',
        '.metric-label{color:#5f6368;}',
        '.metric-value{font-weight:600;}',
        '.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;}',
        '.section-title{font-size:12px;font-weight:700;color:#5f6368;text-transform:uppercase;',
        'margin:16px 0 6px;}',
        '.tip{font-size:12px;color:#3c4043;background:#f8f9fa;border-radius:6px;padding:8px;margin-bottom:6px;}',
        '.res-row{display:flex;justify-content:space-between;font-size:11px;padding:3px 0;color:#5f6368;}',
        '.rerun{width:100%;margin-top:12px;padding:8px;border:1px solid #dadce0;border-radius:6px;',
        'background:#fff;cursor:pointer;font-size:13px;}',
        '.rerun:hover{background:#f1f3f4;}',
        '.note{font-size:10px;color:#9aa0a6;margin-top:10px;line-height:1.4;}'
    ].join('\n');
    shadow.appendChild(style);

    var fab = document.createElement('button');
    fab.className = 'fab';
    fab.textContent = '⚡ Perf';
    shadow.appendChild(fab);

    var panel = document.createElement('div');
    panel.className = 'panel';
    shadow.appendChild(panel);

    fab.addEventListener('click', function () {
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) {
            render();
        }
    });

    function grade(score) {
        if (score === null) return { cls: 'mid', label: '측정중' };
        if (score >= 90) return { cls: 'good', label: score };
        if (score >= 50) return { cls: 'mid', label: score };
        return { cls: 'poor', label: score };
    }

    function fmtMs(v) {
        return v === null || v === undefined ? '측정중' : (v / 1000).toFixed(2) + 's';
    }

    function render() {
        collectNavigationTiming();
        collectResources();
        var result = computeScores();
        var overallGrade = grade(result.overall);
        var opportunities = buildOpportunities();

        var totalSizeKb = (state.resources.reduce(function (s, r) { return s + r.transferSize; }, 0) / 1024).toFixed(0);

        function metricRow(label, value, score) {
            var g = grade(score);
            return '<div class="metric-row"><span class="metric-label">' +
                '<span class="dot" style="background:' + (g.cls === 'good' ? '#137333' : g.cls === 'mid' ? '#b06000' : '#c5221f') + '"></span>' +
                label + '</span><span class="metric-value">' + value + '</span></div>';
        }

        panel.innerHTML =
            '<div class="header"><h2>Local PageSpeed</h2><button class="close">✕</button></div>' +
            '<div class="score-circle ' + overallGrade.cls + '">' + (result.overall === null ? '-' : result.overall) + '</div>' +
            '<div class="section-title">Core Web Vitals</div>' +
            metricRow('LCP (최대 콘텐츠 렌더링)', fmtMs(state.lcp), result.scores.lcp) +
            metricRow('CLS (레이아웃 이동)', state.cls.toFixed(3), result.scores.cls) +
            metricRow('FCP (첫 콘텐츠풀 페인트)', fmtMs(state.fcp), result.scores.fcp) +
            metricRow('TBT (총 차단 시간, 근사)', Math.round(result.tbt) + 'ms', result.scores.tbt) +
            metricRow('TTFB (서버 응답)', fmtMs(state.ttfb), result.scores.ttfb) +
            (state.inpCandidate ? metricRow('INP 후보(최대 입력 지연)', Math.round(state.inpCandidate) + 'ms', null) : '') +
            '<div class="section-title">리소스 (' + state.resources.length + '개 · ' + totalSizeKb + 'KB)</div>' +
            (function () {
                var byType = {};
                state.resources.forEach(function (r) {
                    byType[r.type] = (byType[r.type] || 0) + r.transferSize;
                });
                return Object.keys(byType).map(function (t) {
                    return '<div class="res-row"><span>' + t + '</span><span>' + (byType[t] / 1024).toFixed(0) + 'KB</span></div>';
                }).join('');
            })() +
            '<div class="section-title">개선 제안</div>' +
            opportunities.map(function (t) { return '<div class="tip">' + t + '</div>'; }).join('') +
            '<button class="rerun">다시 측정 (새로고침)</button>' +
            '<div class="note">Lighthouse 실측(가상 네트워크/CPU 제한)과 다르게, 실제 브라우저·현재 네트워크 상태 기준 근사치입니다. CLS/LCP는 상호작용 또는 탭 전환 전까지 갱신됩니다.</div>';

        panel.querySelector('.close').addEventListener('click', function () {
            panel.classList.remove('open');
        });
        panel.querySelector('.rerun').addEventListener('click', function () {
            location.reload();
        });
    }

    // 로드 완료 후 자동으로 한 번 최신 상태 반영 (패널이 열려 있을 때만 갱신)
    addEventListener('load', function () {
        setTimeout(function () {
            if (panel.classList.contains('open')) render();
        }, 1500);
    });

    // 외부에서 결과를 JSON으로 뽑아쓰고 싶을 때
    window.getLocalPageSpeedReport = function () {
        collectNavigationTiming();
        collectResources();
        var result = computeScores();
        return {
            overallScore: result.overall,
            metrics: {
                lcp: state.lcp,
                cls: state.cls,
                fcp: state.fcp,
                tbt: result.tbt,
                ttfb: state.ttfb,
                inp: state.inpCandidate
            },
            resourceCount: state.resources.length,
            totalTransferBytes: state.resources.reduce(function (s, r) { return s + r.transferSize; }, 0),
            opportunities: buildOpportunities()
        };
    };
})();
