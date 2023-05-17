import { Router } from "express";
import { login, newUser } from "../controllers/user.js";

const router = Router();

router.get("/", (req, res) => res.status(200).send("Ça fonctionne"));
router.post("/user/new", newUser);
router.post("/user/login", login);
 
export default router;
