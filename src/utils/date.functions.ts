
export function calculateAge(birthday: Date) {
    var ageDifMs = Date.now() - birthday.getTime()

    var ageDate = new Date(ageDifMs)

    return Math.abs(ageDate.getUTCFullYear() - 1970)
}