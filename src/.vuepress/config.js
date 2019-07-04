const katex = require("katex");

module.exports = {
    title: "ginkgo-web",
    description: "by ginkgo",
    plugins: [
        "@vuepress/last-updated",
        [
            require("./plugins/blog"),
            {
                directories: [
                    {
                        id: "posts",
                        dirname: "blog/_posts",
                        path: "/blog/",
                        itemPermalink: "/blog/:slug",
                        //layout: "BlogHome"
                        pagination: {
                            perPagePosts: 2
                        }
                    }
                ],
                frontmatters: [
                    {
                        id: "tag",
                        keys: ["tag"],
                        path: "/blog/tag/",
                        layout: "Tags",
                        pagination: {
                            perPagePosts: 2
                        }
                    },
                    {
                        id: "category",
                        keys: ["category"],
                        path: "/blog/category/",
                        layout: "Tags",
                        pagination: {
                            perPagePosts: 2
                        }
                    }
                ]
            }
        ]
    ],
    themeConfig: {
        nav: [
            { text: "home", link: "/" },
            { text: "about", link: "/about/" },
            { text: "blog", link: "/blog/" }
        ],
        repo: "https://github.com/GNQG/website",
        repoLabel: "Repository",
        editLinks: true
    },
    markdown: {
        extendMarkdown: md => {
            md.use(require("markdown-it-texmath").use(katex), {
                delimiters: "dollars"
            });
        }
    },
    head: [
        [
            "link",
            {
                rel: "stylesheet",
                href: `https://cdnjs.cloudflare.com/ajax/libs/KaTeX/${
                    katex.version
                }/katex.min.css`
            }
        ]
    ]
};
