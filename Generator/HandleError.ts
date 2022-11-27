import {NextFunction, Request, Response} from "express";
import {CustomError, CustomErrorEnum} from "./CustomError";

function HandleError(
    err: TypeError | CustomError,
    req: Request,
    res: Response,
    next: NextFunction
) {
    let customError = err;

    res.status((customError as CustomError).Status).send(customError);

    if (!(err instanceof CustomError)) {
        customError = new CustomError(CustomErrorEnum.DEFAULT_ERROR);
    }
};

export default HandleError;