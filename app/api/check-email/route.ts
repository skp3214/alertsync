import { initDB } from "@/databases/db";
import { NodeMailerService } from "@/email/nodemailer/email-service";
import { hrEmailValidation } from "@/lib/validation-schemas/hr-schema";
import { HrRepositoryMongo } from "@/repository/mongo-db/hr-repo";
import { OrgRepositoryMongo } from "@/repository/mongo-db/org-repo";
import { HrService } from "@/service/hr-service";

const hrRepo = new HrRepositoryMongo();
const orgRepo = new OrgRepositoryMongo();
const emailService = new NodeMailerService();
const hrService = new HrService(hrRepo, orgRepo, emailService);

export async function POST(req: Request) {

    try {
        await initDB();

        const body = await req.json();

        const validationResult = hrEmailValidation.safeParse(body);
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

        const result = await hrService.checkEmailAvailability(validationResult.data.email);

        return Response.json(result, { status: result.success ? 200 : 400 });

    } catch (error) {
        return Response.json({ success: false, message: 'Error checking email' }, { status: 500 });
    }
}
