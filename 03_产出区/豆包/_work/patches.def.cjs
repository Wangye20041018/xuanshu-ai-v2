/* 补丁定义：按施加顺序排列。module: A|B|C（单字母，匹配 patch.cjs 分组） */
module.exports = function ({ snip }) {
  return [
    /* ============ A 主题引擎 ============ */
    {
      module: 'A', name: 'A1 注入 XSTheme 运行时 + 主题面板组件',
      op: 'insertBefore', anchor: 'const $q="theme"',
      text: snip('xs_theme.panel.js') + '\n' + snip('xs_theme.runtime.js') + '\n'
    },
    {
      module: 'A', name: 'A2 通用页外观卡后插入主题引擎面板',
      op: 'insertAfter',
      anchor: 'options:$O.map(f=>({value:f.code,label:f.label})),value:r,onChange:f=>a(f)})})]}),',
      text: 'o.jsx(XsThemePanel,{}),'
    },

    /* ============ B 设置页重构 ============ */
    {
      module: 'B', name: 'B-defs 注入网关四卡 + 安全健康卡组件定义',
      op: 'insertBefore', anchor: 'const $q="theme"',
      text: snip('b_gateway.js') + '\n' + snip('b_health.js') + '\n'
    },
    {
      module: 'B', name: 'B0a 遥测默认关闭 telemetryEnabled !0->!1',
      op: 'replace',
      find: 'launchAtStartup:!1,telemetryEnabled:!0,gatewayAutoStart:!0',
      replacement: 'launchAtStartup:!1,telemetryEnabled:!1,gatewayAutoStart:!0'
    },
    {
      module: 'B', name: 'B0b 掐断 Qt 匿名上报网络段，仅保留 $a 本地埋点',
      op: 'replace',
      find: 'function Qt(e,t={}){$a(`product.${e}`,t),Rs(async()=>{const{invokeApi:n}=await Promise.resolve().then(()=>wF);return{invokeApi:n}},[],import.meta.url).then(({invokeApi:n})=>n("telemetry:capture",{event:e,properties:t})).catch(n=>{console.debug(`[telemetry] failed to capture product event "${e}"`,n)})}',
      replacement: 'function Qt(e,t={}){try{$a(`product.${e}`,t);}catch(_){}}'
    },
    {
      module: 'B', name: 'B1a 导航 credits 改名为 Token',
      op: 'replace',
      find: '{key:"credits",icon:C6,label:e("credits.title")}',
      replacement: '{key:"credits",icon:C6,label:"Token"}'
    },
    {
      module: 'B', name: 'B1b 删除导航 account 项',
      op: 'replace',
      find: '{key:"account",icon:A6,label:e("account.title")},',
      replacement: ''
    },
    {
      module: 'B', name: 'B1c 删除导航 updates 项',
      op: 'replace',
      find: '{key:"updates",icon:kl,label:e("updates.title")},',
      replacement: ''
    },
    {
      module: 'B', name: 'B1d 导航 feedback 改名为 关于',
      op: 'replace',
      find: '{key:"feedback",icon:Pd,label:e("feedback.title")}',
      replacement: '{key:"feedback",icon:Pd,label:"关于"}'
    },
    {
      module: 'B', name: 'B2 反馈页 $_e 整体替换为关于页',
      op: 'replaceSpan',
      startAnchor: 'function $_e(){',
      endAnchor: 'o.jsx(yq,{})})]})})}',
      replacement: snip('b_about.js')
    },
    {
      module: 'B', name: 'B3 积分页 G_e 整体替换为 Token 用量页',
      op: 'replaceSpan',
      startAnchor: 'function G_e(){',
      endAnchor: 'o.jsx("span",{children:e("credits.noMoreData")})})]})]})]})}',
      replacement: snip('b_token.js')
    },
    {
      module: 'B', name: 'B4 高级卡之后追加 本地推理/硬件/网络/云端 四卡',
      op: 'replace',
      find: 'children:o.jsx(xa,{checked:r,onCheckedChange:a})})]})]})}',
      replacement: 'children:o.jsx(xa,{checked:r,onCheckedChange:a})})]})'
        + ',o.jsx(XsLocalModelCard,{}),o.jsx(XsHardwareCard,{}),o.jsx(XsNetworkCard,{}),o.jsx(XsCloudProviderCard,{})'
        + ']})}'
    },
    {
      module: 'B', name: 'B5 安全页顶部插入安全健康检查卡',
      op: 'insertBefore',
      anchor: 'o.jsxs("div",{className:"bg-white dark:bg-card rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden",children:[o.jsxs("div",{className:"flex items-center gap-2.5 px-6 py-4 pb-2 text-[13px] font-semibold text-foreground border-b border-border/50",children:[o.jsx(rd,{className:"h-[18px] w-[18px] text-[#E55318]"}),e("security.overviewTitle")',
      text: 'o.jsx(XsHealthCard,{}),'
    },

    /* ============ C 首页输入框 ============ */
    {
      module: 'C', name: 'C-defs 注入三档模型来源 + 语云录音组件定义',
      op: 'insertBefore', anchor: 'const $q="theme"',
      text: snip('c_modelmode.js') + '\n' + snip('c_yuyun.js') + '\n'
    },
    {
      module: 'C', name: 'C1 模型下拉前插入 本地/云端/自动 三档控件',
      op: 'insertBefore',
      anchor: 'o.jsx(R$e,{className:"flex min-w-0 items-center"',
      text: 'o.jsx(XsModelMode,{}),'
    },
    {
      module: 'C', name: 'C2 语云占位按钮替换为真实录音组件 XsYuyun',
      op: 'replace',
      find: 'o.jsx("button",{type:"button",onClick:()=>{v(!1),Ce.warning&&Ce.warning("语音识别引擎待接入")},className:"mx-3 mb-3 flex w-[calc(100%-24px)] items-center justify-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-[13px] font-medium text-primary transition-colors hover:bg-primary/20",children:[o.jsx(n1,{className:"h-4 w-4"}),o.jsx("span",{children:"按住说话"})]})',
      replacement: 'o.jsx(XsYuyun,{onText:function(t){f((u?u.replace(/\\s+$/,"")+" ":"")+t);},onDone:function(){v(!1);},disabled:r||a})'
    }
  ];
};
