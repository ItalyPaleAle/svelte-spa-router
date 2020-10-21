export interface RouteDetail {
    route: string | RegExp;
    location: string;
    querystring: string;
    userData?: {};
    component?: {};
    name?: string;
}