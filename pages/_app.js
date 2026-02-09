// import '@/styles/animate.css' // @see https://animate.style/ 
import '@/styles/globals.css'
import '@/styles/utility-patterns.css'

// core styles shared by all of react-notion-x (required)
import '@/styles/notion.css' //  重写部分notion样式
import 'react-notion-x/src/styles.css' // 原版的react-notion-x

import useAdjustStyle from '@/hooks/useAdjustStyle'
import { GlobalContextProvider } from '@/lib/global'
import { getBaseLayoutByTheme } from '@/themes/theme'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo } from 'react'  // ← 添加 useEffect
import { getQueryParam } from '../lib/utils'

// 各种扩展插件 这个要阻塞引入
import BLOG from '@/blog.config'
import ExternalPlugins from '@/components/ExternalPlugins'
import SEO from '@/components/SEO'
import { zhCN } from '@clerk/localizations'
import dynamic from 'next/dynamic'
// import { ClerkProvider } from '@clerk/nextjs'
const ClerkProvider = dynamic(() =>
  import('@clerk/nextjs').then(m => m.ClerkProvider)
)

/**
 * App挂载DOM 入口文件
 * @param {*} param0
 * @returns
 */
const MyApp = ({ Component, pageProps }) => {
  // 一些可能出现 bug 的样式，可以统一放入该钩子进行调整
  useAdjustStyle()

  // ← 在这里添加微信/QQ检测
  useEffect(() => {
    // 只在客户端执行
    if (typeof window === 'undefined') return
    
    const ua = navigator.userAgent.toLowerCase()
    const isWechat = ua.includes('micromessenger')
    const isQQ = ua.includes('qq') || ua.includes('mqqbrowser')
    
    // 检查是否有绕过参数（可选，用于特殊情况）
    const urlParams = new URLSearchParams(window.location.search)
    const bypass = urlParams.get('bypass') === '1'
    
    if ((isWechat || isQQ) && !bypass) {
      // 保存原始内容（可选，如果需要的话）
      // const originalContent = document.body.innerHTML
      
      document.body.innerHTML = `
        <div id="wechat-qq-blocker" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #fff;
          padding: 40px 20px;
          z-index: 99999;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <div style="font-size: 64px; margin-bottom: 20px;">🌐</div>
          <h2 style="font-size: 28px; margin-bottom: 16px; font-weight: 600;">请在浏览器中打开</h2>
          <p style="margin: 0 0 30px 0; line-height: 1.6; font-size: 16px; color: #b8b8b8; max-width: 300px;">
            检测到您正在使用微信或QQ内置浏览器<br/>
            为保证正常访问，请复制链接到浏览器打开
          </p>
          
          <div style="
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
            max-width: 90%;
            word-break: break-all;
            font-size: 14px;
            color: #888;
            font-family: monospace;
          ">${location.href}</div>
          
          <button onclick="copyAndAlert()" style="
            background: #07c160;
            color: #fff;
            border: none;
            padding: 14px 40px;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(7, 193, 96, 0.3);
          ">复制链接</button>
          
          <div style="margin-top: 30px; font-size: 13px; color: #666;">
            💡 点击右上角菜单也可选择"在浏览器打开"
          </div>
        </div>
        <script>
          function copyAndAlert() {
            const url = '${location.href}';
            if (navigator.clipboard) {
              navigator.clipboard.writeText(url).then(() => {
                alert('✅ 链接已复制，请前往浏览器粘贴访问');
              }).catch(() => {
                // 降级方案
                const input = document.createElement('input');
                input.value = url;
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
                alert('✅ 链接已复制，请前往浏览器粘贴访问');
              });
            } else {
              const input = document.createElement('input');
              input.value = url;
              document.body.appendChild(input);
              input.select();
              document.execCommand('copy');
              document.body.removeChild(input);
              alert('✅ 链接已复制，请前往浏览器粘贴访问');
            }
          }
        </script>
      `
      // 阻止后续渲染
      return
    }
  }, [])

  const route = useRouter()
  const theme = useMemo(() => {
    return (
      getQueryParam(route.asPath, 'theme') ||
      pageProps?.NOTION_CONFIG?.THEME ||
      BLOG.THEME
    )
  }, [route])

  // 整体布局
  const GLayout = useCallback(
    props => {
      const Layout = getBaseLayoutByTheme(theme)
      return <Layout {...props} />
    },
    [theme]
  )

  const enableClerk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const content = (
    <GlobalContextProvider {...pageProps}>
      <GLayout {...pageProps}>
        <SEO {...pageProps} />
        <Component {...pageProps} />
      </GLayout>
      <ExternalPlugins {...pageProps} />
    </GlobalContextProvider>
  )
  return (
    <>
      {enableClerk ? (
        <ClerkProvider localization={zhCN}>{content}</ClerkProvider>
      ) : (
        content
      )}
    </>
  )
}

export default MyApp
