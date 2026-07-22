import bcrypt from "bcrypt";


export const hashPassword = async (password: string)=>{
    return bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS));
}

export const comparePassword = async (password: string, hash: string)=>{
    return bcrypt.compare(password, hash);
}



