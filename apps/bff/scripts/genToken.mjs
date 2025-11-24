// Usage: node scripts/genToken.mjs acc-1 3600
import jwt from 'jsonwebtoken';

const accountId = process.argv[2] || 'acc-1';
const ttl = Number(process.argv[3] || 3600);
const secret = process.env.JWT_SECRET || 'devsecret123';

const token = jwt.sign({ sub: accountId }, secret, { expiresIn: ttl });
console.log(token);