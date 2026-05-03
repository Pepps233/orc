import Docker from "dockerode";

const docker = new Docker();

export async function createNetwork(name: string): Promise<string> {
  const networks = await docker.listNetworks({ filters: { name: [name] } });
  if (networks.length > 0) {
    return networks[0].Id;
  }

  const network = await docker.createNetwork({
    Name: name,
    Driver: "bridge",
    Attachable: true,
  });

  return network.id;
}

export async function removeNetwork(name: string): Promise<void> {
  const networks = await docker.listNetworks({ filters: { name: [name] } });
  for (const net of networks) {
    const network = docker.getNetwork(net.Id);
    await network.remove();
  }
}
