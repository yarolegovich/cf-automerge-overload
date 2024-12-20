export * from './ws-object';

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const segments = request.url.split('/');
    const object = env.WS_OBJECT.get(env.WS_OBJECT.idFromName(segments[segments.length - 1]));
    return object.fetch(request);
  }
} satisfies ExportedHandler<Env>;
