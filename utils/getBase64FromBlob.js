const getBase64FromBlob = async (blob) => {
    const reader = new FileReader();
    await new Promise((resolve, reject) => {
        reader.onload = resolve;
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
    return reader.result
}
export default getBase64FromBlob;