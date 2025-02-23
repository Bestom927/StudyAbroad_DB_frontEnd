const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer:{
    proxy:{
      // /api为后端数据接口的上下文路径
      '/api':{
        //target为后端数据接口的地址
        target:'http://43.142.41.192:6001/',
        changeOrigin:true
      },
      // '/spring/v1':{
      //   target:'http://localhost:8090', 
      //   changeOrigin:false,
      //   pathRewrite:{
      //     '^/spring':'/api'
      //   }
      // }
        '/spring/v1':{
        target:'http://43.143.84.166:8090/', 
        changeOrigin:true,
        pathRewrite:{
          '^/spring':'/api'
        }
      }
    }
  }
})
