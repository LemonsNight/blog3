---
// 文章目录导航组件
// 自动生成 H2、H3 标题的目录，支持滚动高亮和点击跳转
---

<script lang="ts">
  import { onMount } from 'svelte';
  
  export let headings: Array<{ id: string; text: string; level: number }> = [];
  
  let activeId = '';
  let headerHeightPx = 64; // px
  let isProgrammaticScroll = false;
  let isObservingScroll = true;
  
  // 追踪所有标题的可见性状态
  const headingStateMap = new Map<string, IntersectionObserverEntry>();
  
  onMount(() => {
    const navBarElement = document.getElementById('navBar');
    if (navBarElement) {
      headerHeightPx = navBarElement.offsetHeight;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        // 更新所有观察到的条目状态
        entries.forEach((entry) => {
          headingStateMap.set(entry.target.id, entry);
        });

        if (isProgrammaticScroll || !isObservingScroll) {
          return; 
        }

        // 从所有当前可见的标题中找最靠上的
        let topMostId = '';
        let minTop = Infinity;
        
        headingStateMap.forEach((entry, id) => {
          if (entry.isIntersecting) {
            const rect = entry.target.getBoundingClientRect();
            if (rect.top < minTop) {
              minTop = rect.top;
              topMostId = id;
            }
          }
        });
        
        if (topMostId && topMostId !== activeId) {
          activeId = topMostId;
        }
      },
      {
        // 顶部留出导航栏高度，底部留出 20% 余量
        rootMargin: `-${headerHeightPx}px 0px -20% 0px`,
        threshold: [0, 0.1, 0.5, 1.0],
      }
    );
    
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });
    
    return () => observer.disconnect();
  });
  
  async function scrollToHeading(id: string) {
    const element = document.getElementById(id);
    if (element) {
      isProgrammaticScroll = true;
      isObservingScroll = false;
      activeId = id;

      const extraOffset = 20;
      const totalOffset = headerHeightPx + extraOffset;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - totalOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // 等待滚动真正结束
      await waitForScrollEnd();
      
      // 结束后再次确认 ID 并解除锁定
      isProgrammaticScroll = false;
      activeId = id;
      
      setTimeout(() => {
        isObservingScroll = true;
      }, 100);
    }
  }

  function waitForScrollEnd(): Promise<void> {
    return new Promise(resolve => {
      let lastScrollY = window.scrollY;
      let sameCount = 0;
      let frameCount = 0;

      const check = () => {
        const currentScrollY = window.scrollY;
        frameCount++;

        if (Math.abs(currentScrollY - lastScrollY) < 1) {
          sameCount++;
        } else {
          sameCount = 0;
          lastScrollY = currentScrollY;
        }

        // 至少运行 10 帧，且连续 5 帧没有位置变化，才认为滚动结束
        if (frameCount > 10 && sameCount > 5) {
          resolve();
        } else {
          requestAnimationFrame(check);
        }
      };
      requestAnimationFrame(check);
    });
  }
</script>

{#if headings.length > 0}
  <nav class="toc-nav" aria-label="文章目录">
    <div class="toc-title-container">
      <h3 class="toc-title">目录</h3>
    </div>
    <div class="toc-list-wrapper">
      <ul class="toc-list">
        {#each headings as heading (heading.id)}
          <li class="toc-item"
              class:active={activeId === heading.id}
              class:level-1={heading.level === 1}
              class:level-2={heading.level === 2}
              class:level-3={heading.level === 3}
              class:level-4={heading.level === 4}
              class:level-5={heading.level === 5}
              class:level-6={heading.level === 6}
          >
            <button
              class="toc-link"
              class:active={activeId === heading.id}
              on:click={() => scrollToHeading(heading.id)}
              title={heading.text}
            >
              {heading.text}
            </button>
          </li>
        {/each}
      </ul>
    </div>
  </nav>
{/if}

<style>
  .toc-nav {
    position: sticky;
    top: 100px;
    max-height: calc(100vh - 120px);
    display: flex;
    flex-direction: column;
    padding-left: 1rem;
    font-family: inherit; /* 使用全局定义的 ChillRoundF */
  }
  
  .toc-title-container {
    padding: 0 0.875rem;
    margin-bottom: 0.75rem;
  }

  .toc-title {
    font-size: 0.75rem;
    font-weight: 700;
    color: #4b5563; /* Gray 600 */
    text-transform: uppercase;
    letter-spacing: 0.1em;
    opacity: 0.8;
  }
  
  :global(.dark) .toc-title {
    color: #9ca3af; /* Gray 400 */
  }
  
  .toc-list-wrapper {
    position: relative;
    overflow-y: auto;
  }

  /* 垂直引导线 - 更加细腻 */
  .toc-list-wrapper::before {
    content: "";
    position: absolute;
    left: 0.75rem;
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: rgba(0, 0, 0, 0.05);
  }

  :global(.dark) .toc-list-wrapper::before {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .toc-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .toc-item {
    position: relative;
    margin: 0;
  }

  /* 激活指示条：使用项目 Accent 色 (Amber) */
  .toc-item.active::before {
    content: "";
    position: absolute;
    left: 0.75rem;
    top: 0.4rem;
    bottom: 0.4rem;
    width: 2px;
    background-color: #f59e0b; /* Amber 500 */
    transform: translateX(-50%);
    z-index: 2;
    border-radius: 99px;
    box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
  }

  :global(.dark) .toc-item.active::before {
    background-color: #fbbf24; /* Amber 400 */
    box-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
  }

  /* 缩进处理 */
  .toc-item.level-1 { padding-left: 0.75rem; }
  .toc-item.level-2 { padding-left: 0.75rem; }
  .toc-item.level-3 { padding-left: 1.75rem; }
  .toc-item.level-4 { padding-left: 2.75rem; }
  .toc-item.level-5 { padding-left: 3.75rem; }
  .toc-item.level-6 { padding-left: 4.75rem; }
  
  .toc-link {
    display: block;
    width: 100%;
    text-align: left;
    padding: 0.35rem 0.875rem;
    font-size: 0.8125rem;
    line-height: 1.6;
    color: #9ca3af; /* Gray 400 */
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-radius: 6px;
  }
  
  :global(.dark) .toc-link {
    color: #6b7280; /* Gray 500 */
  }
  
  .toc-link:hover {
    color: #374151; /* Gray 700 */
    background-color: rgba(0, 0, 0, 0.02);
  }
  
  :global(.dark) .toc-link:hover {
    color: #d1d5db; /* Gray 300 */
    background-color: rgba(255, 255, 255, 0.02);
  }
  
  /* 激活文字颜色：Amber */
  .toc-link.active {
    color: #d97706; /* Amber 600 */
    font-weight: 600;
  }

  :global(.dark) .toc-link.active {
    color: #fbbf24; /* Amber 400 */
  }

  /* 滚动条美化 */
  .toc-list-wrapper::-webkit-scrollbar {
    width: 3px;
  }
  
  .toc-list-wrapper::-webkit-scrollbar-thumb {
    background: transparent;
  }

  .toc-list-wrapper:hover::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }
  
  :global(.dark) .toc-list-wrapper:hover::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
  }
</style>



