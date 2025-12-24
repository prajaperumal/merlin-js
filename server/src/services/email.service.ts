export class EmailService {
    /**
     * Send a circle invitation email (Mock)
     */
    async sendCircleInvite(toEmail: string, circleName: string, inviterName: string) {
        console.log('--------------------------------------------------');
        console.log(`📧 MOCK EMAIL SENT TO: ${toEmail}`);
        console.log(`Subject: You're invited to join ${circleName} on Merlin!`);
        console.log('--------------------------------------------------');
        console.log(`Hey there!`);
        console.log(`${inviterName} has invited you to join their movie circle "${circleName}" on Merlin.`);
        console.log(`Join here to start sharing movie recommendations:`);
        console.log(`http://localhost:3000/`);
        console.log('--------------------------------------------------');

        // Simulating network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return true;
    }
}
