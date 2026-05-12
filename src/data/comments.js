export const comments = [
    {
        id: 1,
        postId: 1,
        userId: 2,
        content: '写得真好！Composition API 确实比 Options API 灵活很多',
        parentId: null,
        replyTo: null,
        createdAt: '2026-05-10T10:30:00Z',
        likeCount: 12,
        dislikeCount: 1,        // 👈 点踩数
        questionCount: 0        // 👈 问号数
    },
    {
        id: 2,
        postId: 1,
        userId: 3,
        content: '`<script setup>` 是真的香，代码量少了一半',
        parentId: null,
        replyTo: null,
        createdAt: '2026-05-10T11:00:00Z',
        likeCount: 8,
        dislikeCount: 0,
        questionCount: 0
    },
    {
        id: 3,
        postId: 1,
        userId: 1,
        content: 'composables 是逻辑复用，mixins 容易命名冲突，而且来源不清晰',
        parentId: 3,
        replyTo: 4,
        createdAt: '2026-05-10T12:30:00Z',
        likeCount: 5,
        dislikeCount: 0,
        questionCount: 2
    },
    {
        id: 4,
        postId: 1,
        userId: 4,
        content: '想问下 composables 和 mixins 有什么区别？',
        parentId: null,
        replyTo: null,
        createdAt: '2026-05-10T12:15:00Z',
        likeCount: 3,
        dislikeCount: 0,
        questionCount: 0
    },
    {
        id: 5,
        postId: 3,
        userId: 2,
        content: '我选 Vue，简单好用',
        parentId: null,
        replyTo: null,
        createdAt: '2026-05-08T14:00:00Z',
        likeCount: 20,
        dislikeCount: 2,
        questionCount: 0
    },
    {
        id: 6,
        postId: 3,
        userId: 1,
        content: '看项目需求吧，大团队用 React 更稳',
        parentId: null,
        replyTo: null,
        createdAt: '2026-05-08T15:30:00Z',
        likeCount: 15,
        dislikeCount: 0,
        questionCount: 1
    },
    {
        id: 7,
        postId: 7,
        userId: 3,
        content: '桌面好酷！求壁纸链接',
        parentId: null,
        replyTo: null,
        createdAt: '2026-05-04T10:00:00Z',
        likeCount: 5,
        dislikeCount: 0,
        questionCount: 0
    },
    {
        id: 8,
        postId: 8,
        userId: 4,
        content: '讲得很清楚，新手福音',
        parentId: null,
        replyTo: null,
        createdAt: '2026-05-03T16:00:00Z',
        likeCount: 9,
        dislikeCount: 0,
        questionCount: 0
    },
    {
        id: 9,
        postId: 8,
        userId: 2,
        content: '同意，期待更多教程',
        parentId: 8,
        replyTo: 4,
        createdAt: '2026-05-03T17:00:00Z',
        likeCount: 3,
        dislikeCount: 0,
        questionCount: 0
    }
]