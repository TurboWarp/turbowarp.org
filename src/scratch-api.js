const API = 'https://trampoline.turbowarp.org/proxy/projects/$id';

const getProjectMeta = async (id) => {
    const response = await fetch(API.replace('$id', id), {
        keepalive: true,
        headers: {
            referer: 'https://project-og.turbowarp.org'
        },
        signal: AbortSignal.timeout(5000)
    });
    if (response.status === 404) {
        throw new Error('Project is unshared');
    }
    if (!response.ok) {
        throw new Error(`Unexpected status code: ${response.status}`);
    }
    return response.json();
};

module.exports = {
    getProjectMeta
};
