import express from 'express'
const app = express()
const port = 3000

import {
  withoutStream as withoutStream_1,
  withStream as withStream_1,
  cleanup as cleanup_1
} from './1-simple-streaming/index.js'
import {
  withoutStream as withoutStream_3,
  withStream as withStream_3
} from './3-transform-data/index.js'
import {
  withoutStream as withoutStream_4,
  withStream as withStream_4
} from './4-compress-it/index.js'
import {
  withoutStream as withoutStream_5,
  withStream as withStream_5
} from './5-store-it-remotely/index.js'

/**
 * Setup and sync the database
 */
import * as db from './db.js'
import { seed } from './seed.js'
await db.sequelize.sync({ force: true })

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/check', async (req, res) => {
  try {
    await db.sequelize.authenticate()
    res.send('Healthy')
  } catch (err) {
    console.error('Unable to connect to the database:', err)
    res.status(500).send('Unhealthy')
  }
})

app.get('/seed', async (req, res) => {
  try {
    const results = await seed();
    return res.send(results);
  } catch (err) {
    console.error('Error seeding database', err);
    return res.status(500).send('Error seeding database: ' + err);
  }
})

/**
 * Setup the various examples
 */
app.get('/1', async (req, res) => {
  console.log('Running example 1')
  const unstreamed = await withoutStream_1();

  /**
   * Force garbage collection to get a more accurate memory usage
   * reading.
   */
  try {
    if (global.gc) {global.gc();}
  } catch (e) {
    console.log("Please use `node --expose-gc index.js`");
    process.exit();
  }

  const streamed = await withStream_1();
  cleanup_1();

  return res.send(`
    <h1>Example 1</h1>
    <h2>Without a stream</h2>
    <pre>${JSON.stringify(unstreamed, null, 2)}</pre>
    <h2>With a stream</h2>
    <pre>${JSON.stringify(streamed, null, 2)}</pre>
  `)
})


app.get('/2', async (req, res) => {
  console.log('Running example 2')
  return res.send('Running example 2')
})

app.get('/three', async (req, res) => {
  console.log('Running example 3')
  const unstreamed = await withoutStream_3();

  /**
   * Force garbage collection to get a more accurate memory usage
   * reading.
   */
  try {
    if (global.gc) {global.gc();}
  } catch (e) {
    console.log("Please use `node --expose-gc index.js`");
    process.exit();
  }

  const streamed = await withStream_3();

  return res.send(`
    <h1>Example 1</h1>
    <h2>Without a stream</h2>
    <pre>${JSON.stringify(unstreamed, null, 2)}</pre>
    <h2>With a stream</h2>
    <pre>${JSON.stringify(streamed, null, 2)}</pre>
  `)
})

app.get('/four', async (req, res) => {
  console.log('Running example 4')
  const unstreamed = await withoutStream_4();

  /**
   * Force garbage collection to get a more accurate memory usage
   * reading.
   */
  try {
    if (global.gc) {global.gc();}
  } catch (e) {
    console.log("Please use `node --expose-gc index.js`");
    process.exit();
  }

  const streamed = await withStream_4();

  return res.send(`
    <h1>Example 1</h1>
    <h2>Without a stream</h2>
    <pre>${JSON.stringify(unstreamed, null, 2)}</pre>
    <h2>With a stream</h2>
    <pre>${JSON.stringify(streamed, null, 2)}</pre>
  `)
})

app.get('/five', async (req, res) => {
  console.log('Running example 5')
  // const unstreamed = await withoutStream_5();

  /**
   * Force garbage collection to get a more accurate memory usage
   * reading.
   */
  try {
    if (global.gc) {global.gc();}
  } catch (e) {
    console.log("Please use `node --expose-gc index.js`");
    process.exit();
  }

  const streamed = await withStream_5();

  return res.send(`
    <h1>Example 5</h1>
    <h2>Without a stream</h2>
    <pre>
    <--- Last few GCs --->

    [92268:0x118008000]   431579 ms: Mark-sweep 4050.9 (4138.3) -> 4040.6 (4143.3) MB, 1557.7 / 0.0 ms  (average mu = 0.261, current mu = 0.010) allocation failure; scavenge might not succeed
    [92268:0x118008000]   434672 ms: Mark-sweep 4056.1 (4143.3) -> 4046.0 (4148.8) MB, 3077.5 / 0.0 ms  (average mu = 0.120, current mu = 0.005) task; scavenge might not succeed
    
    
    <--- JS stacktrace --->
    
    FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
     1: 0x1025cd49c node::Abort() [/Users/joshuapare/.nvm/versions/node/v18.15.0/bin/node]
     2: 0x1025cd68c node::ModifyCodeGenerationFromStrings(v8::Local<v8::Context>, v8::Local<v8::Value>, bool) [/Users/joshuapare/.nvm/versions/node/v18.15.0/bin/node]
     3: 0x10272626c v8::internal::V8::FatalProcessOutOfMemory(v8::internal::Isolate*, char const*, bool) [/Users/joshuapare/.nvm/versions/node/v18.15.0/bin/node]
     4: 0x1028d11f8 v8::internal::EmbedderStackStateScope::EmbedderStackStateScope(v8::internal::Heap*, v8::internal::EmbedderStackStateScope::Origin, cppgc::EmbedderStackState) [/Users/joshuapare/.nvm/versions/node/v18.15.0/bin/node]
     5: 0x1028cfcdc v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags) [/Users/joshuapare/.nvm/versions/node/v18.15.0/bin/node]
     6: 0x102950eb0 v8::internal::ScavengeJob::Task::RunInternal() [/Users/joshuapare/.nvm/versions/node/v18.15.0/bin/node]
     7: 0x10262b434 node::PerIsolatePlatformData::RunForegroundTask(std::__1::unique_ptr<v8::Task, std::__1::default_delete<v8::Task>>) [/Users/joshuapare/.nvm/versions/node/v18.15.0/bin/node]
     8: 0x10262a0a0 node::PerIsolatePlatformData::FlushForegroundTasksInternal() [/Users/joshuapare/.nvm/versions/node/v18.15.0/bin/node]
     9: 0x102eef94c uv__async_io [/Users/joshuapare/.nvm/versions/node/v18.15.0/bin/node]
    10: 0x102f020f0 uv__io_poll [/Users/joshuapare/.nvm/versions/node/v18.15.0/bin/node]
    11: 0x102eefe1c uv_run [/Users/joshuapare/.nvm/versions/node/v18.15.0/bin/node]
    12: 0x10251d704 node::SpinEventLoop(node::Environment*) [/Users/joshuapare/.nvm/versions/node/v18.15.0/bin/node]
    13: 0x10260a3f8 node::NodeMainInstance::Run() [/Users/joshuapare/.nvm/versions/node/v18.15.0/bin/node]
    14: 0x10259a430 node::LoadSnapshotDataAndRun(node::SnapshotData const**, node::InitializationResult const*) [/Users/joshuapare/.nvm/versions/node/v18.15.0/bin/node]
    15: 0x10259a6b4 node::Start(int, char**) [/Users/joshuapare/.nvm/versions/node/v18.15.0/bin/node]
    16: 0x193e13f28 start [/usr/lib/dyld]
    [1]    92249 abort      npm run start
    I couldn't even run this. Heap limit got reached.
    </pre>
    <h2>Without a stream</h2>
    <pre>${JSON.stringify(streamed, null, 2)}</pre>
  `)
})

app.get('*', (req, res) => {
  res.status(404).send('Not Found')
})

/**
 * Start the server
 */
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})


// /**
//  * Handle exit signals
//  */
// const exitHandler = async () => {
//   console.log('Received exit signal')
//   await db.sequelize.close()
//   server.close(() => {
//     console.log('HTTP server closed')
//     process.exit(0)
//   })
// }
// process.on('SIGTERM', exitHandler)
// process.on('SIGINT', exitHandler)