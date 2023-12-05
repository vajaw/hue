## hue连接受kerberos保护的kyuubi问题记录
### 背景
公司使用的cdh6.3.2，为方便数据开发、分析的使用，调研了开源的kyuubi。集群中使用 sentry + kerberos 进行权限管理，以及用户认证。所以给每个组件兼容kerberos认证是绕不过去的问题。
### 问题出现的过程
1、在kyuubi搭建好后，为kyuubi单独申请了 kyuubi/admin@HADOOP.COM租户作为kyuubi连接hivemetastore的代理用户。      
2、hiveserver2使用 hive/_HOST@HADOOP.com作为连接hivemetastore的代理用户。  
3、hue在识别kyuubi服务时，走的hiveserver2协议，会从hiveserver2所在的hive-site.xml文件中来读取princpal，此时hiveserver2的principal配置的hive/_HOST@HADOOP.COM。所以hue在连接kyuubi服务时，没有使用kyuubi/admin@HADOOP.COM，将会有kerberos认证失败的问题。   
4、因此kyuubi服务最好与hiveserver2使用相同的principal，将会避免这个问题。   
### kyuubi Server报错日志记录
```
2023-12-01 11:02:02.547 ERROR org.apache.thrift.transport.TSaslTransport: SASL negotiation failure
javax.security.sasl.SaslException: GSS initiate failed
        at com.sun.security.sasl.gsskerb.GssKrb5Server.evaluateResponse(GssKrb5Server.java:199) ~[?:1.8.0_191]
        at org.apache.thrift.transport.TSaslTransport$SaslParticipant.evaluateChallengeOrResponse(TSaslTransport.java:539) ~[libthrift-0.9.3.jar:0.9.3]
        at org.apache.thrift.transport.TSaslTransport.open(TSaslTransport.java:283) ~[libthrift-0.9.3.jar:0.9.3]
        at org.apache.thrift.transport.TSaslServerTransport.open(TSaslServerTransport.java:41) ~[libthrift-0.9.3.jar:0.9.3]
        at org.apache.thrift.transport.TSaslServerTransport$Factory.getTransport(TSaslServerTransport.java:216) ~[libthrift-0.9.3.jar:0.9.3]
        at org.apache.kyuubi.service.authentication.HadoopThriftAuthBridgeServer$TUGIAssumingTransportFactory$$anon$4.run(HadoopThriftAuthBridgeServer.scala:117) ~[kyuubi-common_2.12-1.6.1-incubating.jar:1.6.1-incubating]
        at org.apache.kyuubi.service.authentication.HadoopThriftAuthBridgeServer$TUGIAssumingTransportFactory$$anon$4.run(HadoopThriftAuthBridgeServer.scala:116) ~[kyuubi-common_2.12-1.6.1-incubating.jar:1.6.1-incubating]
        at java.security.AccessController.doPrivileged(Native Method) ~[?:1.8.0_191]
        at javax.security.auth.Subject.doAs(Subject.java:360) ~[?:1.8.0_191]
        at org.apache.hadoop.security.UserGroupInformation.doAs(UserGroupInformation.java:1855) ~[hadoop-client-api-3.3.4.jar:?]
        at org.apache.kyuubi.service.authentication.HadoopThriftAuthBridgeServer$TUGIAssumingTransportFactory.getTransport(HadoopThriftAuthBridgeServer.scala:116) ~[kyuubi-common_2.12-1.6.1-incubating.jar:1.6.1-incubating]
        at org.apache.thrift.server.TThreadPoolServer$WorkerProcess.run(TThreadPoolServer.java:269) ~[libthrift-0.9.3.jar:0.9.3]
        at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149) ~[?:1.8.0_191]
        at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624) ~[?:1.8.0_191]
        at java.lang.Thread.run(Thread.java:748) ~[?:1.8.0_191]
Caused by: org.ietf.jgss.GSSException: Failure unspecified at GSS-API level (Mechanism level: Invalid argument (400) - Cannot find key of appropriate type to decrypt AP REP - AES256 CTS mode with HMAC SHA1-96)
        at sun.security.jgss.krb5.Krb5Context.acceptSecContext(Krb5Context.java:856) ~[?:1.8.0_191]
        at sun.security.jgss.GSSContextImpl.acceptSecContext(GSSContextImpl.java:342) ~[?:1.8.0_191]
        at sun.security.jgss.GSSContextImpl.acceptSecContext(GSSContextImpl.java:285) ~[?:1.8.0_191]
        at com.sun.security.sasl.gsskerb.GssKrb5Server.evaluateResponse(GssKrb5Server.java:167) ~[?:1.8.0_191]
        ... 14 more
Caused by: sun.security.krb5.KrbException: Invalid argument (400) - Cannot find key of appropriate type to decrypt AP REP - AES256 CTS mode with HMAC SHA1-96
        at sun.security.krb5.KrbApReq.authenticate(KrbApReq.java:278) ~[?:1.8.0_191]
        at sun.security.krb5.KrbApReq.<init>(KrbApReq.java:149) ~[?:1.8.0_191]
        at sun.security.jgss.krb5.InitSecContextToken.<init>(InitSecContextToken.java:108) ~[?:1.8.0_191]
        at sun.security.jgss.krb5.Krb5Context.acceptSecContext(Krb5Context.java:829) ~[?:1.8.0_191]
        at sun.security.jgss.GSSContextImpl.acceptSecContext(GSSContextImpl.java:342) ~[?:1.8.0_191]
        at sun.security.jgss.GSSContextImpl.acceptSecContext(GSSContextImpl.java:285) ~[?:1.8.0_191]
        at com.sun.security.sasl.gsskerb.GssKrb5Server.evaluateResponse(GssKrb5Server.java:167) ~[?:1.8.0_191]
        ... 14 more

```

