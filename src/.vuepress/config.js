const katex = require("katex");
// const moment = require("moment-timezone");

module.exports = {
    locales: {
        "/": {
            lang: "ja", // this will be set as the lang attribute on <html>
        },
    },
    title: "GNQG.DEV",
    description: "by ginkgo",
    plugins: [
        /*
        [
            "@vuepress/last-updated",
            {
                transformer: (timestamp, _lang) => {
                    return moment.tz(timestamp, "Asia/Tokyo").format();
                }
            }
        ], */
        [
            "@vuepress/blog",
            {
                directories: [
                    {
                        id: "posts",
                        dirname: "_blogposts",
                        path: "/blog/",
                        title: "blog",
                        itemPermalink: "/blog/:slug/",
                        layout: "BlogPager",
                        pagination: {
                            lengthPerPage: 4,
                            getPaginationPageTitle(index, _key) {
                                return `blog (page ${index})`;
                            },
                            layout: "BlogPager",
                        },
                    },
                ],
                frontmatters: [
                    {
                        id: "tag",
                        title: "tag | blog",
                        keys: ["tag"],
                        path: "/blog/tag/",
                        layout: "BlogClassifier",
                        scopeLayout: "BlogClassifierKeyPager",
                        getScopePageTitle(key) {
                            return `tag: ${key} | blog`;
                        },
                        pagination: {
                            lengthPerPage: 4,
                            getPaginationPageTitle(index, key) {
                                return `tag: ${key} (page ${index}) | blog`;
                            },
                            layout: "BlogClassifierKeyPager",
                        },
                    },
                    {
                        id: "category",
                        title: "category | blog",
                        keys: ["category"],
                        path: "/blog/category/",
                        layout: "BlogClassifier",
                        scopeLayout: "BlogClassifierKeyPager",
                        getScopePageTitle(key) {
                            return `category: ${key} | blog`;
                        },
                        pagination: {
                            lengthPerPage: 4,
                            getPaginationPageTitle(index, key) {
                                return `category: ${key} (page ${index}) | blog`;
                            },
                            layout: "BlogClassifierKeyPager",
                        },
                    },
                ],
            },
        ],
        "remote-url",
        [
            "seo",
            {
                title: ($page, $site, path) => {
                    return path === "/"
                        ? $site.title
                        : ($page.title || $page.frontmatter.title || path) +
                              " | " +
                              $site.title;
                },
                tags: ($page) => $page.frontmatter.tag,
                twitterCard: (_) => "summary",
                type: ($page) => {
                    const path = $page.regularPath;
                    if (path === "/") {
                        return "website";
                    } else if (path === "/about/") {
                        return "profile";
                    } else if (path.startsWith("/blog/")) {
                        return $page.layout === "Post" ? "article" : "blog";
                    } else {
                        return "article";
                    }
                },
            },
        ],
    ],
    themeConfig: {
        domain: "https://gnqg.dev",
        nav: [
            { text: "home", link: "/" },
            { text: "about", link: "/about/" },
            { text: "blog", link: "/blog/" },
        ],
        repo: "https://github.com/GNQG/website",
        repoLabel: "Repository",
        editLinks: true,
    },
    markdown: {
        extendMarkdown: (md) => {
            md.use(require("markdown-it-texmath").use(katex), {
                delimiters: "dollars",
            });
        },
    },
    head: [
        [
            "link",
            {
                rel: "stylesheet",
                href:
                    "https://cdn.jsdelivr.net/npm/fork-awesome@1.1.7/css/fork-awesome.min.css",
                integrity:
                    "sha256-gsmEoJAws/Kd3CjuOQzLie5Q3yshhvmo7YNtBG7aaEY=",
                crossorigin: "anonymous",
            },
        ],
        [
            "link",
            {
                rel: "stylesheet",
                href: `https://cdnjs.cloudflare.com/ajax/libs/KaTeX/${katex.version}/katex.min.css`,
                crossorigin: "anonymous",
            },
        ],
    ],
};
