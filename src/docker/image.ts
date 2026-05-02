import Docker from "dockerode";

const docker = new Docker();

export async function ensureImage(
  imageName: string,
  imageTag: string,
): Promise<void> {
  const fullName = `${imageName}:${imageTag}`;

  const images = await docker.listImages({
    filters: { reference: [fullName] },
  });
  if (images.length > 0) return;

  const stream = await docker.buildImage(
    {
      context: process.cwd(),
      src: ["Dockerfile", "src/agent/"],
    },
    { t: fullName },
  );

  await new Promise<void>((resolve, reject) => {
    docker.modem.followProgress(stream, (err, output) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
