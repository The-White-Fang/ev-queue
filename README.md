# ev-queue
Queue asynchronous functions, that can be executed in sequence with delay.

# Motivation
I came across a scenario where I needed to schedule data fetching for a third-party API to update the database for historical records. I wanted to serve fresh data from the API to the users unless they are browsing through previous records, in which case the data should be served from the database. The problem with that is the cron job was specifically built to handle delays keeping in mind the delay that was needed to not exceed the rate limit. If a user were to send a request at the time cron is running, it would have messed up delays possibly making the entire task fail.

Now, there can be multiple ways to work around this scenario. And so, I created this little thing.

## How does it work?
It creates two queues 1. for high-priority tasks and 2. for low-priority ones. At every cycle, it checks if the high-priority queue has any tasks if tasks are present, they are queued first to be executed.

## Installation

```bash
npm install ev-queue
```

## Usage
```javascript
const EvQueue = require('ev-queue');

const options = { delay: 100 }

const queue = new EvQueue(options);
```

### Options
- `delay` - the delay between async tasks (in ms)
- `maxSize` - the maximum size of the queue for low-priority tasks. Defaults to `100`.
- `maxHighPriority` - the maximum size of the queue for high-priority tasks. Defaults to `10`.

## Methods

### `add`

  Adds an async task to the queue.

```javascript
queue.add(asyncTask, priority);
/** returns a promise that resolves with the result of asyncTask */
```

* `asyncTask`: A function that returns a `Promise`.
* `priority`: `low` or `high`. Defaults to `low`.

## Upcoming features
- Options to add concurrency.
- No blocking execution of high-priority tasks.
- Option to specify rate-limit directly.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
