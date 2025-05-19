import e from "express";
import 'dotenv/config' ;
import cors from "cors";
import connectDB from "./DB/db.js";
import blogRoutes from "./Routes/Blog.Routes.js";
import authRoutes from "./Routes/Auth.Routes.js";
const app = e();
const PORT = process.env.PORT || 8080;

connectDB()

app.use(cors());
app.use(e.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.listen(PORT,()=>{
    console.log(`App is listening on ${PORT}`)
})