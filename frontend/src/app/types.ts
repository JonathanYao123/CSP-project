export type Map = {
    name: string;
    url : string;
}

export type Project = {
    cid: number;
    author: string;
    canvas: string;
}

export type Account = {
    username: string;
    password: string;
}

export type Mutation = {
    saveProject(cid: number, author: String, canvas: String): Project;
    updateProject(cid: number, canvas: String): Project;
    addAccount(username: String, password: String): Account;
}

export type Query = {
    map: Map;
    project: Project;
    account: Account;
}