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

      // --- 修改开始：全新的简约白色UI ---
      document.body.innerHTML = `
        <div id="wechat-qq-blocker" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #ffffff; /* 背景改为纯白 */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #333333; /* 主文本颜色改为深灰 */
          padding: 40px 24px;
          z-index: 99999;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
        ">
          <div style="margin-bottom: 24px; color: #07c160;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M15 3H21V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <h2 style="font-size: 24px; margin-bottom: 12px; font-weight: 700; color: #1d1d1f;">请在浏览器中打开</h2>
          <p style="margin: 0 0 32px 0; line-height: 1.6; font-size: 16px; color: #86868b; max-width: 320px;">
            当前环境无法正常访问<br/>
            请复制下方链接，并在Safari或Chrome等浏览器中粘贴打开。
          </p>

          <div style="
            background: #f5f5f7; /* 浅灰背景 */
            border: 1px solid #e1e1e3; /* 细腻的边框 */
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
            width: 100%;
            max-width: 400px;
            word-break: break-all;
            font-size: 14px;
            color: #6e6e73;
            font-family: 'SF Mono', SFMono-Regular, ui-monospace, monospace; /* 更好的等宽字体栈 */
            box-sizing: border-box;
          ">${location.href}</div>

          <button onclick="copyAndAlert()" style="
            background: #07c160; /* 保持微信绿，作为行动点强调 */
            color: #fff;
            border: none;
            padding: 14px 48px;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            font-weight: 600;
            transition: background-color 0.2s;
            box-shadow: none; /* 移除厚重的阴影，更扁平 */
            -webkit-tap-highlight-color: transparent;
            outline: none;
          "
          onmouseover="this.style.backgroundColor='#06ad56'"
          onmouseout="this.style.backgroundColor='#07c160'"
          >复制链接</button>

          <div style="margin-top: 32px; font-size: 13px; color: #999999;">
            💡 提示：点击右上角菜单也可选择"在浏览器打开"
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
      // --- 修改结束 ---

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
