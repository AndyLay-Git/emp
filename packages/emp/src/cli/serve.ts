import express, {Express} from 'express'
import cors from 'cors'
import compression from 'compression'
import store from 'src/helper/store'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import logger, {logTag} from 'src/helper/logger'
import prepareURLs from 'src/helper/prepareURLs'
import https from 'https'
import {clearConsole} from 'src/helper/utils'
import {getPorts} from './getPort'
class Serve {
  public app: Express
  public resourcePath = ''
  constructor() {
    const app = express()
    app.use(compression())
    app.use(cors())
    this.app = app
    this.resourcePath = path.join(store.empRoot, 'resource')
  }
  startLogger({httpsOptions, host, port, publicPath}: any) {
    if (publicPath && (publicPath.indexOf('http://') > -1 || publicPath.indexOf('https://') > -1)) {
      logger.info(`- Network: ${chalk.hex('#3498db')(publicPath)} \n`)
    } else {
      const protocol = httpsOptions ? 'https' : 'http'
      const realHost = host || '0.0.0.0'
      const urls = prepareURLs(protocol, realHost, port as any, publicPath)
      // logger.info(`  - Run Serve At:`)
      logger.info(`- Local:   ${chalk.hex('#3498db')(urls.localUrlForTerminal)}`)
      logger.info(`- Network: ${chalk.hex('#3498db')(urls.lanUrlForTerminal)} \n`)
    }
  }
  async setup() {
    if (store.config.debug.clearLog) clearConsole()
    logTag(`server running at:`)
    const staticRoot = store.resolve(store.config.build.outDir)
    this.app.use(express.static(staticRoot))
    //TODO: 加入SSG SSR需要
    // 默认入口 适配 single spa
    const html = await fs.readFile(path.join(staticRoot, 'index.html'), 'utf8')
    this.app.get('*', (req, res) => res.send(html))
    //
    const {host, port} = store.config.server
    const httpsOptions = store.config.server.https
    const publicPath = store.config.base
    const serverPort = await getPorts(port, host)

    //
    if (httpsOptions) {
      const httpsServer = https.createServer(
        typeof httpsOptions !== 'boolean'
          ? httpsOptions
          : {
              key: fs.readFileSync(path.join(this.resourcePath, 'emp.key')),
              cert: fs.readFileSync(path.join(this.resourcePath, 'emp.cert')),
            },
        this.app,
      )
      httpsServer.listen(serverPort, () => {
        this.startLogger({httpsOptions, host, port: serverPort, publicPath})
      })
    } else {
      this.app.listen(serverPort, () => {
        this.startLogger({httpsOptions, host, port: serverPort, publicPath})
      })
    }
  }
}

export default new Serve()
