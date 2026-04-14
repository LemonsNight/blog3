---
// 文章目录导航组件
// 自动生成 H2、H3 标题的目录，支持滚动高亮和点击跳转
---

<script>
  import { onMount } from 'svelte';
  
  export let headings: Array<{ id: string; text: string; level: number }> = [];
  
  let activeId = '';
  
  onMount(() => {
    // 监听滚动事件，高亮当前章节
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeId = entry.target.id;
          }
        });
      },
      {
        rootMargin: '-100px 0px -60% 0px',
        threshold: 0,
      }
    );
    
    // 观察所有标题元素
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });
    
    return () => observer.disconnect();
  });
  
  // 平滑滚动到指定标题
  function scrollToHeading(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      activeId = id;
    }
  }
</script>

{#if headings.length > 0}
  <nav class="toc-nav" aria-label="文章目录">
    <h3 class="toc-title">目录</h3>
    <ul class="toc-list">
      {#each headings as heading (heading.id)}
        <li class="toc-item" class:level-2={heading.level === 2} class:level-3={heading.level === 3}>
          <button
            class="toc-link"
            class:active={activeId === heading.id}
            on:click={() => scrollToHeading(heading.id)}
          >
            {heading.text}
          </button>
        </li>
      {/each}
    </ul>
  </nav>
{/if}

<style>
  .toc-nav {
    position: sticky;
    top: 100px;
    max-height: calc(100vh - 120px);
    overflow-y: auto;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  :global(.dark) .toc-nav {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(255, 255, 255, 0.08);
  }
  
  .toc-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  :global(.dark) .toc-title {
    color: #d1d5db;
  }
  
  .toc-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .toc-item {
    margin-bottom: 0.5rem;
  }
  
  .toc-item.level-3 {
    padding-left: 1rem;
  }
  
  .toc-link {
    display: block;
    width: 100%;
    text-align: left;
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #6b7280;
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  :global(.dark) .toc-link {
    color: #9ca3af;
  }
  
  .toc-link:hover {
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.08);
  }
  
  :global(.dark) .toc-link:hover {
    color: #60a5fa;
    background: rgba(96, 165, 250, 0.08);
  }
  
  .toc-link.active {
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.12);
    font-weight: 500;
  }
  
  :global(.dark) .toc-link.active {
    color: #60a5fa;
    background: rgba(96, 165, 250, 0.12);
  }
  
  /* 滚动条样式 */
  .toc-nav::-webkit-scrollbar {
    width: 4px;
  }
  
  .toc-nav::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .toc-nav::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
  
  :global(.dark) .toc-nav::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
  }
</style>
