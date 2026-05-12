-- ============================================
-- 先清空旧数据
-- ============================================
DELETE FROM tb_reaction;
DELETE FROM tb_comment;
DELETE FROM tb_post;
DELETE FROM tb_user_bar;
DELETE FROM tb_bar;

-- ============================================
-- 贴吧（用有头像的用户创建）
-- ============================================
INSERT INTO tb_bar (id, name, description, avatar) VALUES
                                                       (1, 'JavaScript', 'JavaScript 前端开发交流', '/images/bar1.png'),
                                                       (2, 'Vue.js', 'Vue 框架爱好者聚集地', '/images/bar2.png'),
                                                       (3, 'React', 'React 生态讨论区', '/images/bar3.png'),
                                                       (4, '程序员日常', '聊聊程序员的那些事儿', '/images/default-bar-background.jpg'),
                                                       (5, '开源项目', '分享和发现优秀的开源项目', '/images/default-bar-background.jpg'),
                                                       (6, '技术问答', '有问题？来这里提问', '/images/default-bar-background.jpg');

-- ============================================
-- 帖子（用有头像的用户：2,3,5,6,7,9）
-- ============================================
INSERT INTO tb_post (id, title, content, user_id, bar_id, view_count, like_count, comment_count, is_pinned) VALUES
                                                                                                                (1, 'Vue 3 Composition API 实战技巧分享', '最近在项目中深入使用了 Composition API，总结了一些实用技巧...', 2, 2, 1523, 89, 3, 1),
                                                                                                                (2, '分享一个自己写的脚手架工具', '周末写了一个脚手架工具，可以快速生成 Vue3 + Vite 项目模板...', 2, 5, 892, 56, 0, 0),
                                                                                                                (3, 'React 和 Vue 到底该怎么选？', '新手经常会纠结这个问题...', 3, 3, 2341, 156, 2, 0),
                                                                                                                (4, '今天遇到一个神奇的 bug', '写了一个小时的代码，最后发现是拼写错误...', 5, 4, 3456, 234, 0, 0),
                                                                                                                (5, 'TypeScript 高级类型体操入门', '分享一些 TypeScript 高级类型的用法...', 6, 1, 678, 45, 0, 0),
                                                                                                                (6, '求助：Vue3 中 watch 和 watchEffect 的区别', '看官方文档还是有点迷糊...', 5, 6, 1200, 34, 0, 0),
                                                                                                                (7, '分享一下我的开发环境桌面', '最近重新布置了桌面，感觉效率提升了不少。', 7, 4, 2300, 156, 1, 0),
                                                                                                                (8, '新手入门 Vue3 教程视频', '录制了一个 Vue3 入门视频，适合零基础。', 9, 2, 5678, 345, 2, 0);

-- ============================================
-- 评论（用有头像的用户互相评论）
-- ============================================
INSERT INTO tb_comment (id, content, user_id, post_id, parent_id, reply_to, like_count) VALUES
                                                                                            (1, '写得真好！Composition API 确实比 Options API 灵活很多', 3, 1, NULL, NULL, 12),
                                                                                            (2, '<script setup> 是真的香，代码量少了一半', 5, 1, NULL, NULL, 8),
                                                                                            (3, '想问下 composables 和 mixins 有什么区别？', 6, 1, NULL, NULL, 3),
                                                                                            (4, 'composables 是逻辑复用，mixins 容易命名冲突', 2, 1, 3, 6, 5),
                                                                                            (5, '我选 Vue，简单好用', 7, 3, NULL, NULL, 20),
                                                                                            (6, '看项目需求吧，大团队用 React 更稳', 2, 3, NULL, NULL, 15),
                                                                                            (7, '大团队确实更倾向 React，生态更成熟', 5, 3, 6, 2, 3),
                                                                                            (8, '桌面好酷！求壁纸链接', 6, 7, NULL, NULL, 5),
                                                                                            (9, '讲得很清楚，新手福音', 5, 8, NULL, NULL, 9),
                                                                                            (10, '同意，期待更多教程', 3, 8, 9, 5, 3);

-- ============================================
-- 关注贴吧
-- ============================================
INSERT INTO tb_user_bar (user_id, bar_id) VALUES
                                              (2, 1), (2, 2), (2, 4),
                                              (3, 2), (3, 5),
                                              (5, 1), (5, 3),
                                              (6, 4), (6, 6),
                                              (7, 4), (7, 5),
                                              (9, 2), (9, 3);

-- ============================================
-- 态度（点赞/踩/问号）
-- ============================================
INSERT INTO tb_reaction (user_id, target_type, target_id, reaction_type) VALUES
                                                                             (2, 'post', 3, 'like'),
                                                                             (2, 'post', 7, 'like'),
                                                                             (3, 'post', 1, 'like'),
                                                                             (3, 'post', 8, 'like'),
                                                                             (5, 'post', 1, 'like'),
                                                                             (5, 'post', 3, 'dislike'),
                                                                             (6, 'post', 1, 'like'),
                                                                             (6, 'post', 6, 'like'),
                                                                             (7, 'post', 5, 'question'),
                                                                             (9, 'post', 4, 'like'),
                                                                             (2, 'comment', 1, 'like'),
                                                                             (3, 'comment', 3, 'like'),
                                                                             (5, 'comment', 1, 'like'),
                                                                             (6, 'comment', 5, 'dislike');