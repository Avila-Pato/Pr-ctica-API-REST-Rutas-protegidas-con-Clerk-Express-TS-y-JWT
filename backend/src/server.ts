// Importar dotenv para manejar las variables de entorno
import 'dotenv/config';
import cors from 'cors'
// Importar express y los tipos necesarios para el manejo de requests y responses
import express, { Request, Response } from 'express';

// Importar Clerk y los middlewares necesarios para autenticación
import { clerkMiddleware, clerkClient, requireAuth } from '@clerk/express';

// Crear instancia de Express
const app = express();


// Obtener el puerto de las variables de entorno, con un valor predeterminado
const PORT = process.env.PORT || 3000;

// Agregar middleware de Clerk para manejar autenticación en las rutas
app.use(clerkMiddleware());
//Habilitarndo cors en el navegador
app.use(cors())

// Crear una interfaz para las requests autenticadas
interface AuthenticatedRequest extends Request {
    auth?: {
        userId: string; // Agregar la propiedad userId que Clerk proporciona tras autenticar
    }
}

// Ruta pública que responde con un mensaje básico
app.get('/api', (req: Request, res: Response) => {
    res.json({ message: "Hello world" });
});

// Ruta protegida, accesible solo para usuarios autenticados
app.get(
    '/api/protected',
    requireAuth({ signInUrl: "/api/unauthorized" }), // Middleware que redirige si no está autenticado
    async (req: AuthenticatedRequest, res: Response) => {
        // Verificar si la request no tiene datos de autenticación
        if (!req.auth) {
            res.status(401).json({ message: "Unauthorized" }); // Respuesta si no está autenticado
            return;
        }

        // Obtener el userId del objeto auth en la request
        const { userId } = req.auth;

        // Usar Clerk para obtener los datos del usuario autenticado
        const user = await clerkClient.users.getUser(userId);

        // Responder con los datos del usuario no puede ser return porque expres no response con un json
        res.json({ user });
    }
);

// Ruta para usuarios no autenticados que intenta acceder a una ruta protegida
app.get('/api/unauthorized', (req: Request, res: Response) => {
    res.status(401).json({ message: "Unauthorized...." }); // Mensaje de error si no está autorizado
});

// Iniciar el servidor en el puerto especificado y mostrar un mensaje en consola
app.listen(PORT, () => {
    console.log(`Server running on Port:${PORT}`);
});
