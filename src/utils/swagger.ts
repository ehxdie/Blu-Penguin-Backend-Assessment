import swaggerJSDoc from "swagger-jsdoc";
import type { Options } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import type { Express, Request, Response } from "express";

const options: Options = {
    definition: {
        openapi: "3.0.1",
        info: {
            title: "Formvive API Documentation",
            version: "1.0.0",
        },
        schemes: ["http", "https"],
        servers: [{ url: "http://localhost:3000/api/v1" }],
        components: {
            securitySchemas: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/api/**.ts", "./src/schemas/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);

function swaggerDocs(app: Express, port: number) {
    // Swagger page
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Docs in JSON format
    app.get("/docs.json", (req: Request, res: Response) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });

    console.log(`Docs available at http://localhost:${port}/docs`);
}

export default swaggerDocs;
