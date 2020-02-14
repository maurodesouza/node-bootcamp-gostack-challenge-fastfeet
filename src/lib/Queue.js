import Bee from 'bee-queue';

import redisConfig from '../config/redis';

import newDelivery from '../app/jobs/newDelivery';

const jobs = [newDelivery];

class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  init() {
    jobs.forEach(({ key }) => {
      this.queues[key] = {
        bee: new Bee(key, { redis: redisConfig }),
      };
    });
  }

  add(queue, job) {
    this.queues[queue].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach(({ key, handle }) => {
      const { bee } = this.queues[key];

      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED ${err}`);
  }
}

export default new Queue();