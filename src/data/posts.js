import { users } from './user.js'

// 帖子列表
export const posts = [
    {
        id: 1,
        title: 'Vue 3 Composition API 实战技巧分享',
        content: `11111111111`,
        userId: 1,
        barId: 2,
        viewCount: 1523,
        likeCount: 89,
        commentCount: 34,
        isPinned: true,
        createdAt: '2026-05-10T08:00:00Z'
    },
    {
        id: 2,
        title: '分享一个自己写的脚手架工具',
        content: `周末写了一个脚手架工具，可以快速生成 Vue3 + Vite 项目模板。

特点：
- 开箱即用的项目结构
- 内置 Pinia、Vue Router
- 封装好的 Axios 请求
- 暗黑模式支持

GitHub 地址会放在评论区，欢迎 star！`,
        userId: 1,
        barId: 5,
        viewCount: 892,
        likeCount: 56,
        commentCount: 12,
        isPinned: false,
        createdAt: '2026-05-09T14:30:00Z'
    },
    {
        id: 3,
        title: 'React 和 Vue 到底该怎么选？',
        content: `新手经常会纠结这个问题，说说我的看法：

**React**
- 生态更大，工作机会多
- JSX 灵活度很高
- 需要自己搭配状态管理

**Vue**
- 上手简单，文档友好
- 官方解决方案完善
- 适合中小型项目快速开发

其实两个都很好，关键看团队和项目需求。`,
        userId: 3,
        barId: 3,
        viewCount: 2341,
        likeCount: 156,
        commentCount: 67,
        isPinned: false,
        createdAt: '2026-05-08T10:00:00Z'
    },
    {
        id: 4,
        title: '今天遇到一个神奇的 bug',
        content: `写了一个小时的代码，最后发现是拼写错误...

\`\`\`javascript
// 写成了
consoel.log('hello')
// 应该是
console.log('hello')
\`\`\`

所以变量命名真的很重要！大家有什么类似的经历吗？`,
        userId: 4,
        barId: 4,
        viewCount: 3456,
        likeCount: 234,
        commentCount: 89,
        isPinned: false,
        createdAt: '2026-05-07T16:20:00Z'
    },
    {
        id: 5,
        title: 'TypeScript 高级类型体操入门',
        content: `分享一些 TypeScript 高级类型的用法：

\`\`\`typescript
// 深度只读
type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object 
        ? DeepReadonly<T[P]> 
        : T[P]
}

// 条件类型
type IsString<T> = T extends string ? true : false
\`\`\`

刚开始觉得难，多写写就习惯了。`,
        userId: 2,
        barId: 1,
        viewCount: 678,
        likeCount: 45,
        commentCount: 23,
        isPinned: false,
        createdAt: '2026-05-06T09:15:00Z'
    },
    {
        id: 6,
        title: '求助：Vue3 中 watch 和 watchEffect 的区别',
        content: `看官方文档还是有点迷糊，有没有大佬用通俗的话解释一下？

什么时候用 watch，什么时候用 watchEffect？`,
        userId: 4,
        barId: 6,
        viewCount: 1200,
        likeCount: 34,
        commentCount: 56,
        isPinned: false,
        createdAt: '2026-05-05T11:00:00Z'
    },
    {
        id: 7,
        title: '分享一下我的开发环境桌面',
        content: '最近重新布置了桌面，感觉效率提升了不少。',
        userId: 1,
        barId: 4,
        mediaType: 'image',
        mediaUrl: '/images/default-bar-background.jpg',
        mediaWidth: 1920,
        mediaHeight: 1080,
        viewCount: 2300,
        likeCount: 156,
        commentCount: 45,
        isPinned: false,
        createdAt: '2026-05-04T08:00:00Z'
    },
    {
        id: 8,
        title: '新手入门 Vue3 教程视频',
        content: '录制了一个 Vue3 入门视频，适合零基础。',
        userId: 2,
        barId: 2,
        mediaType: 'video',
        mediaUrl: '/video/default.mp4',
        mediaWidth: 1920,
        mediaHeight: 1080,
        viewCount: 5678,
        likeCount: 345,
        commentCount: 123,
        isPinned: false,
        createdAt: '2026-05-03T14:00:00Z'
    },
    {
        id: 9,
        title: '推荐一个超好用的 VS Code 插件',
        content: 'GitHub Copilot 的免费替代品，链接在下面',
        userId: 3,
        barId: 5,
        mediaType: 'link',
        mediaUrl: 'https://github.com/features/copilot',
        viewCount: 1234,
        likeCount: 67,
        commentCount: 23,
        isPinned: false,
        createdAt: '2026-05-02T10:00:00Z'
    }
]

// 根据帖子获取用户信息
export const getPostUser = (userId) => {
    if (userId === 1) return users[0]
    return users.find(u => u.id === userId) || users[0]
}