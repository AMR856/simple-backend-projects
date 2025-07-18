const https = require('https');
const { URL } = require('url');

const handleGitHubActivitiy = (userName) => {
  const slicedUserName = userName.slice(0, -1);
  const apiUrl = new URL(`https://api.github.com/users/${slicedUserName}/events`);
  const options = {
    host: apiUrl.hostname,
    port: 443,
    path: apiUrl.pathname,
    method: 'GET',
    headers: {
      'User-Agent': 'Node.js', // Required by GitHub API
    },
  };
  const req = https.request(options, (res) => {
  if (res.statusCode === 200) {
    let data = '';
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on('end', () => {
      data = JSON.parse(data);
      const watchEvents = [];
      const forkEvents = [];
      const createEvents = [];
      const deleteEvents = [];
      const pushEvents = {};
      data.forEach(element => {
        const splittedElement = element['repo']['name'].split('/');
        if (element['type'] == 'WatchEvent')
          watchEvents.push(`https://github.com/${splittedElement[0]}/${splittedElement[1]}`);
        else if (element['type'] == 'CreateEvent')
          createEvents.push(`https://github.com/${splittedElement[0]}/${splittedElement[1]}`);
        else if (element['type'] == 'ForkEvent')
          forkEvents.push(`https://github.com/${splittedElement[0]}/${splittedElement[1]}`);
        else if (element['type'] == 'DeleteEvent')
          deleteEvents.push(`https://github.com/${splittedElement[0]}/${splittedElement[1]}`);
        // Push Events
        else if(element['type'] == 'PushEvent'){
          const repoName = splittedElement[0] + '/' + splittedElement[1];
          if (repoName in pushEvents) pushEvents[repoName]++;
          else pushEvents[repoName] = 1;
        }
      });
      console.log(`User ${slicedUserName}: `);
      Object.entries(pushEvents).forEach(([key, value]) => {
        console.log(`- Pushed ${value} commits to ${key}`);
      });
      watchEvents.forEach(event => {
        console.log(`- Starred repo ${event}`);
      });
      deleteEvents.forEach(event => {
        console.log(`- Deleted repo ${event}`);
      });
      forkEvents.forEach(event => {
        console.log(`- Forked repo ${event}`);
      });
      createEvents.forEach(event => {
        console.log(`- Created repo ${event}`);
      });
    });
  } else {
    console.log('Request Failed');
  }
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  req.end();
};

process.stdout.write('Enter GitHub username: ');
process.stdin.on('data', (userName) => {
  handleGitHubActivitiy(userName);
});
