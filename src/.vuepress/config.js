const katex = require("katex");

module.exports = {
    title: "ginkgo-web",
    description: "by ginkgo",
    plugins: [
        "@vuepress/last-updated",
        [
            require("./plugins/my-blog"),
            {
                postsDir: "blog/_posts",
                categoryIndexPageUrl: "/blog/category/",
                tagIndexPageUrl: "/blog/tag/",
                permalink: "/blog/entry/:slug"
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
