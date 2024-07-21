import {config} from '../config/index.js'
import {NodeSSH} from 'node-ssh'

const ssh = new NodeSSH()

export const getStatus = async () => {
    try {
        await ssh.connect(config.mikrotik);  
        const isHttpDisabled = (await (ssh.execCommand('/ip firewall nat print where comment="rds, http" and disabled=yes'))).stdout.split(/\r\n|\r|\n/).length > 1 ? true : false;
        const isHttpsDisabled = (await (ssh.execCommand('/ip firewall nat print where comment="rds, https" and disabled=yes'))).stdout.split(/\r\n|\r|\n/).length > 1 ? true : false;
        const isRdsUdpDisabled = (await (ssh.execCommand('/ip firewall nat print where comment="rds, udp" and disabled=yes'))).stdout.split(/\r\n|\r|\n/).length > 1 ? true : false;
        return {status: "ok", isHttpDisabled, isHttpsDisabled, isRdsUdpDisabled, isAllDisabled: isHttpDisabled && isHttpsDisabled && isRdsUdpDisabled ? true : false};
      } catch (error) {
        return {status: "bad", error};
      } finally {
        ssh.dispose();
      }
}

export const lock = async () => {
    try {
        await ssh.connect(config.mikrotik);  
        const isHttpDisabled = await ssh.execCommand('/ip firewall nat set disabled=yes [find comment="rds, http"]')
        const isHttpsDisabled = await ssh.execCommand('/ip firewall nat set disabled=yes [find comment="rds, https"]')
        const isRdsUdpDisabled = await ssh.execCommand('/ip firewall nat set disabled=yes [find comment="rds, udp"]')
        await ssh.execCommand('/ip firewall connection {:foreach r in=[find] do={remove $r}}')
        return {status: "ok"};
      } catch (error) {
        return {status: "bad", error};
      } finally {
        ssh.dispose();
      }
}

export const unlock = async () => {
    try {
        await ssh.connect(config.mikrotik);  
        const isHttpDisabled = await ssh.execCommand('/ip firewall nat set disabled=no [find comment="rds, http"]')
        const isHttpsDisabled = await ssh.execCommand('/ip firewall nat set disabled=no [find comment="rds, https"]')
        const isRdsUdpDisabled = await ssh.execCommand('/ip firewall nat set disabled=no [find comment="rds, udp"]')
        return {status: "ok"};
      } catch (error) {
        return {status: "bad", error};
      } finally {
        ssh.dispose();
      }
}