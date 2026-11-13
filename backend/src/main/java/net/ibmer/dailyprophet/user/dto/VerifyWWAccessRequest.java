package net.ibmer.dailyprophet.user.dto;

public record VerifyWWAccessRequest(
        String oldName, String specialCharUnicode, String uid
) {
}
