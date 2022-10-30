import { EventEmitter } from 'events';
import { v4 as uuidV4 } from 'uuid';
import CircularArray from './CircularArray';

export type EventQueueOptions = {
  /**
   * @remarks delay between task execution
   * @defaultValue `1`
   */
  delay?: number;
  /**
   * @remarks max tasks that can be in queue at a time (excluding high priority tasks)
   * @defaultValue `100`
   */
  maxSize?: number;
  /**
   * @remarks max tasks with high priority
   * @defaultValue `10`
   */
  maxHighPriority?: number;
};

type TaskFunc<T> = () => Promise<T>;

type Task<T> = {
  id: string;
  exec: TaskFunc<T>;
};

class EventQueue<T> {
  private options: EventQueueOptions;
  private queue: CircularArray<Task<T>>;
  private high: CircularArray<Task<T>>;
  private isRunning = false;

  private listener = new EventEmitter();

  private delay: () => Promise<null>;

  constructor(options: EventQueueOptions) {
    const { delay = 0, maxHighPriority = 10, maxSize = 100 } = options;

    this.options = { delay, maxHighPriority, maxSize };

    this.queue = new CircularArray<Task<T>>(maxSize);
    this.high = new CircularArray<Task<T>>(maxHighPriority);
    this.delay = () => new Promise((resolve) => setTimeout(resolve, delay));
  }

  private async process() {
    this.isRunning = true;
    while (1) {
      const task = this.high.shift() || this.queue.shift();

      if (!task) {
        break;
      }

      task
        .exec()
        .then((data) => this.listener.emit(task.id, null, data))
        .catch((error) => this.listener.emit(task.id, error, null));

      await this.delay();
    }
    this.isRunning = false;
  }

  /**
   * @param priority - defaultValue `'low'`
   * @returns
   */
  add(task: TaskFunc<T>, priority: 'high' | 'low' = 'low') {
    const taskObj: Task<T> = { id: uuidV4(), exec: task };
    const promise = new Promise<T>((resovle, reject) => {
      this.listener.once(taskObj.id, (error: Error, data: T) => {
        if (error) {
          return reject(error);
        }
        resovle(data);
      });
    });

    if (priority === 'high') {
      this.high.push(taskObj);
    } else if (priority === 'low') {
      this.queue.push(taskObj);
    } else {
      throw new Error('Invalid priority');
    }

    if (!this.isRunning) {
      this.process();
    }

    return promise;
  }
}

export default EventQueue;
