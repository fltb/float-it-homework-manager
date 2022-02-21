# 接口

## 通用的

``` json
// for all
config: {
    siteTitle: String,
    footer: String, // html
}
page: {
    title: String,
    userName: String // not for register and login
}
// for index
index: {
    table: Array<{
        id: Number,
        name: String,
        date: String // yyyy-mm-dd hh:mm:ss
    }>,
}
// for problem
problem: {
    content: String, // HTML
    submitted: Boolean,
    submittedPersonNumber: Number
}
```
