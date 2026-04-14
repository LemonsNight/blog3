import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { visit } from 'unist-util-visit';

// https://astro.build/config
export default defineConfig({
  // 请修改为你自己的线上地址，谢谢茄子
  site: 'https://lemonsnight.github.io',

  // 如果你的网站在子路径下（例如 `https://example.com/koi/`），则填写 `/koi/`
  // 在根路径下（例如 `https://example.com/`）则填写 `/`
  base: process.env.NODE_ENV === "production" ? "/blog3/" : "",

  integrations: [mdx(), sitemap(), svelte()],

  markdown: {
    remarkRehype: {
      footnoteLabel: "脚注",
      footnoteBackLabel: '文档内容的脚注',
    },
    remarkPlugins: [
      // 自动为标题添加 ID
      () => {
        return (tree) => {
          const idCountMap = new Map(); // 用于跟踪每个 ID 出现的次数
          
          visit(tree, 'heading', (node) => {
            let text = '';
            if (node.children && node.children.length > 0) {
              node.children.forEach((child) => {
                if (child.type === 'text') {
                  text += child.value;
                }
              });
            }
            if (text) {
              // 生成基础 ID
              const baseId = text
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '');
              
              // 如果 ID 已存在，添加序号
              const count = idCountMap.get(baseId) || 0;
              idCountMap.set(baseId, count + 1);
              const id = count > 0 ? `${baseId}-${count}` : baseId;
              
              if (!node.data) node.data = {};
              if (!node.data.hProperties) node.data.hProperties = {};
              node.data.hProperties.id = id;
            }
          });
        };
      }
    ]
  },

  vite: {
    plugins: [tailwindcss()]
  }
});