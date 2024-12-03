import { Request } from "express";
import {IAdmin} from "../src/models/admin.model";

declare global{
    namespace Express{
        interface Request{
            user?: IAdmin ;
        }
    }
}

export interface CustomRequest extends Request {
    user?: IAdmin ;
}