import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function apiPlugin() {
  const inMemoryDonations: any[] = [
    {
      id: 'seed-veg-biryani-01',
      foodName: 'Royal Hyderabadi Veg Biryani',
      servings: 25,
      remainingServings: 25,
      prepDate: new Date(Date.now() - 90 * 60 * 1000).toISOString().slice(0, 10),
      prepTime: new Date(Date.now() - 90 * 60 * 1000).toTimeString().slice(0, 5),
      prepTimestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 270 * 60 * 1000).toISOString().slice(0, 10),
      expiryTime: new Date(Date.now() + 270 * 60 * 1000).toTimeString().slice(0, 5),
      expiryTimestamp: new Date(Date.now() + 270 * 60 * 1000).toISOString(),
      pickupDeadline: new Date(Date.now() + 180 * 60 * 1000).toISOString(),
      pickupAddress: '42 Orchid Heights, Central Avenue, Baner',
      city: 'Pune',
      landmark: 'Behind Westend Mall, Gate 3',
      latitude: 18.5596,
      longitude: 73.7797,
      category: 'vegetarian',
      storageCondition: 'heated_insulated',
      status: 'available',
      contactName: 'Chef Rajesh Sharma (Hotel Orchid)',
      contactPhone: '+91 98230 45678'
    },
    {
      id: 'seed-chapati-curry-02',
      foodName: 'Fresh Wheat Chapatis & Mix Veg Curry',
      servings: 40,
      remainingServings: 40,
      prepDate: new Date(Date.now() - 130 * 60 * 1000).toISOString().slice(0, 10),
      prepTime: new Date(Date.now() - 130 * 60 * 1000).toTimeString().slice(0, 5),
      prepTimestamp: new Date(Date.now() - 130 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 240 * 60 * 1000).toISOString().slice(0, 10),
      expiryTime: new Date(Date.now() + 240 * 60 * 1000).toTimeString().slice(0, 5),
      expiryTimestamp: new Date(Date.now() + 240 * 60 * 1000).toISOString(),
      pickupDeadline: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
      pickupAddress: 'Shivaji Nagar Community Hall, FC Road',
      city: 'Pune',
      landmark: 'Opposite Modern College Gate',
      latitude: 18.5284,
      longitude: 73.8441,
      category: 'vegetarian',
      storageCondition: 'room_temperature',
      status: 'available',
      contactName: 'Mrs. Sunita Deshmukh',
      contactPhone: '+91 94220 12345'
    }
  ];

  const inMemoryClaims: any[] = [];
  const inMemoryNotifications: any[] = [];
  const inMemoryFeedback: any[] = [];

  return {
    name: 'backend-api-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url.startsWith('/api')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        // Helper to parse JSON body
        const getBody = (): Promise<any> => {
          return new Promise((resolve) => {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              try { resolve(JSON.parse(body || '{}')); }
              catch { resolve({}); }
            });
          });
        };

        // 1. GET /api/donations
        if (req.url.split('?')[0] === '/api/donations' && req.method === 'GET') {
          res.end(JSON.stringify({ status: 200, count: inMemoryDonations.length, data: inMemoryDonations }));
          return;
        }

        // 2. POST /api/donations (Create Food Donation with Expiry validation)
        if (req.url === '/api/donations' && req.method === 'POST') {
          const body = await getBody();
          const { foodName, servings, prepDate, prepTime, expiryDate, expiryTime, pickupDeadline } = body;

          if (!foodName || !servings || !prepDate || !prepTime || !expiryDate || !expiryTime) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing required fields: foodName, servings, prepDate, prepTime, expiryDate, expiryTime' }));
            return;
          }

          const prepMs = new Date(`${prepDate}T${prepTime}:00`).getTime();
          const expMs = new Date(`${expiryDate}T${expiryTime}:00`).getTime();
          const deadlineMs = pickupDeadline ? new Date(pickupDeadline).getTime() : 0;

          if (expMs <= prepMs) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Expiry date and time must be later than preparation date and time.' }));
            return;
          }

          if (deadlineMs && deadlineMs > expMs) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Pickup deadline must not be later than food expiry time.' }));
            return;
          }

          const newDonation = {
            id: `donation_${Date.now()}`,
            ...body,
            remainingServings: servings,
            status: 'available',
            createdAt: new Date().toISOString()
          };
          inMemoryDonations.unshift(newDonation);

          res.statusCode = 201;
          res.end(JSON.stringify({ status: 201, message: 'Donation created successfully', data: newDonation }));
          return;
        }

        // 3. POST /api/claims (Claim Food & Generate Token)
        if (req.url === '/api/claims' && req.method === 'POST') {
          const body = await getBody();
          const { donationId, recipientName, recipientPhone, claimedServings } = body;
          const donation = inMemoryDonations.find(d => d.id === donationId);

          if (!donation) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Donation not found.' }));
            return;
          }

          const token = `TK-${Math.floor(1000 + Math.random() * 9000)}`;
          const claim = {
            id: `claim_${Date.now()}`,
            donationId,
            foodName: donation.foodName,
            recipientName,
            recipientPhone,
            claimedServings: claimedServings || donation.remainingServings,
            verificationToken: token,
            tokenVerified: false,
            status: 'pending_pickup',
            claimedAt: new Date().toISOString()
          };
          inMemoryClaims.unshift(claim);

          // Update donation
          donation.remainingServings = Math.max(0, donation.remainingServings - claim.claimedServings);
          if (donation.remainingServings === 0) donation.status = 'claimed';

          // Donor Notification
          inMemoryNotifications.unshift({
            id: `notif_${Date.now()}`,
            role: 'donor',
            title: 'Your Food Has Been Claimed!',
            message: `Your food donation, ${donation.foodName}, has been claimed by ${recipientName}. Servings: ${claim.claimedServings}.`,
            verificationToken: token,
            claimedAt: claim.claimedAt
          });

          res.statusCode = 201;
          res.end(JSON.stringify({ status: 201, claim, verificationToken: token }));
          return;
        }

        // 4. POST /api/verify-token (Verify Pickup Token)
        if (req.url === '/api/verify-token' && req.method === 'POST') {
          const body = await getBody();
          const { token } = body;
          const claim = inMemoryClaims.find(c => c.verificationToken === token);

          if (!claim) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Invalid verification token. No claim found.' }));
            return;
          }

          if (claim.tokenVerified) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'This token has already been verified and used.' }));
            return;
          }

          claim.tokenVerified = true;
          claim.status = 'picked_up';

          res.end(JSON.stringify({
            status: 200,
            message: 'Food pickup completed successfully! Please share your feedback to help improve our food-sharing community.',
            claim
          }));
          return;
        }

        // 5. GET /api/safety-rules
        if (req.url === '/api/safety-rules' && req.method === 'GET') {
          res.end(JSON.stringify({
            status: 200,
            standard: 'FDA / FSSAI Perishable Food Rules',
            rules: [
              { category: 'non-vegetarian', storage: 'room_temperature', maxSafeHours: 3.0, warningHours: 1.5 },
              { category: 'non-vegetarian', storage: 'refrigerated', maxSafeHours: 24.0, warningHours: 18.0 },
              { category: 'vegetarian', storage: 'room_temperature', maxSafeHours: 5.0, warningHours: 3.0 },
              { category: 'vegetarian', storage: 'refrigerated', maxSafeHours: 48.0, warningHours: 36.0 }
            ]
          }));
          return;
        }

        // 6. GET /api/notifications
        if (req.url === '/api/notifications' && req.method === 'GET') {
          res.end(JSON.stringify({ status: 200, data: inMemoryNotifications }));
          return;
        }

        // 7. GET /api/feedback and POST /api/feedback
        if (req.url === '/api/feedback') {
          if (req.method === 'GET') {
            res.end(JSON.stringify({ status: 200, data: inMemoryFeedback }));
            return;
          }
          if (req.method === 'POST') {
            const body = await getBody();
            const feedbackRecord = {
              id: `fb_${Date.now()}`,
              ...body,
              createdAt: new Date().toISOString()
            };
            inMemoryFeedback.unshift(feedbackRecord);
            res.statusCode = 201;
            res.end(JSON.stringify({ status: 201, message: 'Feedback submitted successfully', data: feedbackRecord }));
            return;
          }
        }

        // Default API response
        res.end(JSON.stringify({ message: 'Annapurna Backend REST API active', endpoint: req.url }));
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
