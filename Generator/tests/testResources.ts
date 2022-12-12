// code taken from here: //https://stackoverflow.com/questions/46042613/how-to-test-the-type-of-a-thrown-exception-in-jest#:~:text=In%20Jest%20you%20have%20to%20pass%20a%20function,you%20also%20want%20to%20check%20for%20error%20message%3A
class NoErrorThrownError extends Error {};
export const getError = async <TError>(call: () => unknown): Promise<TError> => {
    try {
        await call();
        throw new NoErrorThrownError();
    } catch (error: unknown) {
        return error as TError;
    }
};