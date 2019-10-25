<h1 align="center">
  <a title="The socket optimizer" href="http://kalm.js.org">
    <img alt="Kalm" width="300px" src="https://kalm.js.org/images/kalmv3.png" />
    <br/>
  </a>
  kalm-cli
</h1>
<h3 align="center">
  Enjoy <a title="The socket optimizer" href="https://github.com/kalm/kalm.js">kalm</a> from the comfort of the CLI
  <br/><br/>
</h3>
<br/>

## Getting started

Kalm-cli allows you to quickly build an echo server **or** send socket messages to kalm servers;

- With no programming necessary
- Without having to setup a node environement (self-contained executable)

**Getting the executable**

```
curl https://raw.githubusercontent.com/kalm/kalm-cli/v1.0.0/bin/kalm-cli --output ./kalm-cli
```

**Listening and broadcasting back**

```
kalm-cli listen ws my_channel -p 8080

```

This will create an echo server on port 8080 that broadcasts to all connected kalm clients subscribed to channel `my_channel`.


**Writing to a kalm server**

```
kalm-cli write ws my_channel '{"some": "json_payload"}' -p 8080

```

**Tailing messages from a kalm server**

```
kalm-cli tail ws my_channel -p 8080

```

**More options**

Check out the manual via `kalm-cli --help`

## Contribute

If you think of something that you want, [open an issue](//github.com/kalm/kalm-cli/issues/new) or file a pull request, we'll be more than happy to take a look!

## License 

[Apache 2.0](LICENSE) (c) 2019 Frederic Charette
