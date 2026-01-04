import axios from 'axios';

export const taskfiltering = async (req, res) => {
  //here the schedule follows the cron job format
  /* Below is the specific cron job structure
* * * * *  command
│ │ │ │ │
│ │ │ │ └── day of week (0–6)  (Sunday = 0 or 7)
│ │ │ └──── month (1–12)
│ │ └────── day of month (1–31)
│ └──────── hour (0–23)
└────────── minute (0–59)
*/
  const { type, payload, schedule } = req.body;
  const routes = {
    http_request: '/http',
    email_sender: '/email',
    text_summarizer: '/text',
  };
  if (!type || !payload)
    return res
      .status(400)
      .json({ message: 'request and payload are required' });
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Unauthorized access' });
  }
  const body = { payload, schedule };
  const route = routes[type];
  if (!route) {
    return res.status(400).json({ message: 'Wrong type of task entered' });
  }
  try {
    const response = await axios.post(`http://task-worker:8003${route}`, body, {
      headers: { Authorization: req.headers.authorization },
      timeout: 10000,
    });
    return res.status(200).json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res.status(503).json({ message: 'Task service unavailable', err });
  }
};
