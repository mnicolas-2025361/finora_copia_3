import type { UserRole } from "../models/user.model.js";
export interface RegisterData {
    name: string;
    email: string;
    password: string;
}
export interface LoginData {
    email: string;
    password: string;
}
export declare function registerUser(data: RegisterData): Promise<any>;
export declare function loginUser(data: LoginData): Promise<{
    token: string;
    user: {
        id: any;
        name: any;
        email: any;
        role: UserRole;
    };
}>;
export declare function loginWithGoogle(idToken: string): Promise<{
    token: string;
    user: {
        id: any;
        name: any;
        email: any;
        role: UserRole;
    };
}>;
//# sourceMappingURL=auth.service.d.ts.map