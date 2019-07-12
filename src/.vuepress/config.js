const katex = require("katex");
const moment = require("moment-timezone");

module.exports = {
    title: "ginkgo-web",
    description: "by ginkgo",
    plugins: [
        [
            "@vuepress/last-updated",
            {
                transformer: (timestamp, _lang) => {
                    return moment.tz(timestamp, "Asia/Tokyo").format();
                }
            }
        ],
        [
            require("./plugins/blog"),
            {
                directories: [
                    {
                        id: "posts",
                        name: "blog",
                        dirname: "blog/_posts",
                        path: "/blog/",
                        itemPermalink: "/blog/:slug/",
                        layout: "DirectoryIndex",
                        pagination: {
                            lengthPerPage: 2,
                            layout: "DirectoryPagination"
                        }
                    }
                ],
                frontmatters: [
                    {
                        id: "tag",
                        name: "tag",
                        keys: ["tag"],
                        path: "/blog/tag/",
                        layout: "Tag",
                        pagination: {
                            lengthPerPage: 4,
                            layout: "FrontmatterPagination"
                        }
                    },
                    {
                        id: "category",
                        name: "category",
                        keys: ["category"],
                        path: "/blog/category/",
                        layout: "Category",
                        pagination: {
                            lengthPerPage: 4,
                            layout: "FrontmatterPagination"
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
