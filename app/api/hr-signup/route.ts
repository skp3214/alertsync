import { NodeMailerService } from "@/email/nodemailer/email-service";
import { HrRepositoryMongo } from "@/repository/mongo-db/hr-repo";
import { OrgRepositoryMongo } from "@/repository/mongo-db/org-repo";
import { HrService } from "@/service/hr-service";
import { hrSchemaValidation } from "@/lib/validation-schemas/hr-schema";
import { initDB } from "@/databases/db";

const hrRepo = new HrRepositoryMongo();
const orgRepo = new OrgRepositoryMongo();
const emailService = new NodeMailerService();
const hrService = new HrService(hrRepo, orgRepo, emailService);

export async function POST(req: Request) {

    try {
        await initDB();

        const body = await req.json();

        const validationResult = hrSchemaValidation.safeParse(body);
        if (!validationResult.success) {
            let errors = '';

            validationResult.error.issues.forEach(issue => {
                errors += `${issue.message}.`;
            });

            return Response.json(
                {
                    success: false,
                    message: errors,
                },
                { status: 400 }
            );
        }

        const result = await hrService.create(validationResult.data);

        return Response.json(result, { status: 201 });

    } catch (error: any) {

        return Response.json(
            {
                success: false,
                message: 'Internal server error'
            },
            { status: 500 }
        );
    }
}
