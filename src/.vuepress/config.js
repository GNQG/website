module.exports = {
    title: "website",
    description: "by ginkgo",
    plugins: [
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
        repoLabel: "Repository"
    }
};
