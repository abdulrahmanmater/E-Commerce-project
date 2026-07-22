//findUserByEmail.ts

import { LoginRequestDto, UserWithPassword } from "../dtos/login.dto";
import pool from "../config/db";


const loginRepository = async (user: LoginRequestDto) => {
    const existedUser = await pool.query <UserWithPassword> (`
            SELECT id, full_name, email, role, password_hash FROM users WHERE email = $1
        `, [user.email]
        )
        if (existedUser.rowCount === 0) {
            return null;
        }
        return existedUser.rows[0];
}

export default loginRepository;