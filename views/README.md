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
        title: String,
        updatedAt: String // yyyy-mm-dd hh:mm:ss
    }>,
}
// for problem
problem: {
    content: String, // HTML
    submitted: Boolean,
    submittedPersonNumber: Number
}

//for admin
admin: {
    active: {
        user: Boolean,
        submit: Boolean,
        problem: Boolean
    },
    content: String // HTML
    // for user
    users: Array<User>
}
```
