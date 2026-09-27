# OFFLINE AI

Target: a useful AI that continues to work with Wi-Fi disabled.

## Runtime contract
The offline body will use a local OpenAI-compatible inference endpoint bound to loopback only (for example `127.0.0.1`). The specific runtime and model remain replaceable.

## Completion definition
Offline AI is complete only when:
1. model weights are stored locally;
2. inference succeeds with networking disabled;
3. chat history/memory is local;
4. document retrieval/embeddings are local;
5. no telemetry or remote fonts/scripts are required;
6. a clean install + model import procedure exists;
7. an automated offline test proves no external network dependency.

## Hardware profiles
We will ship model profiles rather than pretending one model fits every machine: compact, balanced, and workstation.
